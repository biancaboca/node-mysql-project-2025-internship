const database = require('../Database/database');
const fs = require('fs').promises;
const path = require('path');

class MigrationManager {
    constructor() {
        this.scriptsPath = path.join(__dirname, 'scripts');
        this.operationsPath = path.join(__dirname, 'operations');
        this.migrationTableName = 'schema_migrations';
    }

    // Creează tabelul pentru tracking migrații
    async createMigrationTable() {
        try {
            await database.connect();
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    execution_time_ms INT DEFAULT 0,
                    status ENUM('success', 'failed', 'rolled_back') NOT NULL,
                    error_message TEXT NULL,
                    
                    INDEX idx_migration_name (migration_name),
                    INDEX idx_executed_at (executed_at),
                    INDEX idx_status (status)
                )
            `;
            
            await database.query(createTableQuery);
            console.log('✅ Migration tracking table ready');
            return true;
        } catch (error) {
            console.error('❌ Error creating migration table:', error);
            throw error;
        }
    }

    // Obține lista migrațiilor executate
    async getExecutedMigrations() {
        try {
            await database.connect();
            const result = await database.query(
                `SELECT migration_name FROM ${this.migrationTableName} WHERE status = 'success'`
            );
            return result.map(row => row.migration_name);
        } catch (error) {
            console.error('❌ Error getting executed migrations:', error);
            return [];
        }
    }
    
    // Verifică dacă o migrație există în tabel (indiferent de status)
    async migrationExists(migrationName) {
        try {
            await database.connect();
            const result = await database.query(
                `SELECT COUNT(*) as count FROM ${this.migrationTableName} WHERE migration_name = ?`,
                [migrationName]
            );
            return result[0].count > 0;
        } catch (error) {
            console.error(`❌ Error checking if migration ${migrationName} exists:`, error);
            return false;
        }
    }

    // Obține lista fișierelor de migrație
    async getMigrationFiles() {
        try {
            // Get files from scripts directory (for backward compatibility)
            const scriptFiles = await fs.readdir(this.scriptsPath);
            
            // Get both SQL and JS files
            const scriptMigrations = scriptFiles
                .filter(file => file.endsWith('.sql') || file.endsWith('.js'))
                .map(file => {
                    // Use file name without extension as migration name
                    const migrationName = path.basename(file, path.extname(file));
                    return { 
                        file, 
                        path: path.join(this.scriptsPath, file),
                        name: migrationName
                    };
                });
            
            // Get files from operations directory structure
            const operationTypes = ['create', 'insert', 'update', 'alter', 'delete'];
            let operationMigrations = [];
            
            for (const opType of operationTypes) {
                try {
                    const opTypePath = path.join(this.operationsPath, opType);
                    const opFiles = await fs.readdir(opTypePath);
                    const opMigrations = opFiles
                        .filter(file => file.endsWith('.sql') || file.endsWith('.js'))
                        .map(file => { 
                            const migrationName = path.basename(file, path.extname(file));
                            return {
                                file: `${opType}_${file}`, // Prefix with operation type for uniqueness
                                path: path.join(opTypePath, file),
                                type: opType,
                                name: migrationName
                            };
                        });
                    
                    operationMigrations = [...operationMigrations, ...opMigrations];
                } catch (err) {
                    // Skip if directory doesn't exist
                    if (err.code !== 'ENOENT') {
                        console.warn(`Warning reading ${opType} directory:`, err);
                    }
                }
            }
            
            // Deduplicate migrations by name (prefer JS over SQL)
            const migrationsByName = {};
            
            // Process all migrations and prefer JS files
            [...scriptMigrations, ...operationMigrations].forEach(migration => {
                const migrationName = migration.name;
                
                // If we haven't seen this migration yet, or we're replacing an SQL with a JS file
                if (!migrationsByName[migrationName] || 
                    (migrationsByName[migrationName].file.endsWith('.sql') && migration.file.endsWith('.js'))) {
                    migrationsByName[migrationName] = migration;
                }
            });
            
            // Convert back to array and sort
            const allMigrations = Object.values(migrationsByName);
            allMigrations.sort((a, b) => {
                const numA = parseInt(a.name.split('_')[0]) || 0;
                const numB = parseInt(b.name.split('_')[0]) || 0;
                return numA - numB;
            });
            
            return allMigrations;
        } catch (error) {
            console.error('❌ Error reading migration files:', error);
            return [];
        }
    }

    // Execută o migrație individuală
    async executeMigration(migration) {
        const startTime = Date.now();
        const migrationPath = migration.path;
        const migrationFile = migration.file;
        const migrationName = migration.name;
        const isJsFile = migrationFile.endsWith('.js');
        
        try {
            const operationType = migration.type 
                ? migration.type.toUpperCase()
                : '';
                
            console.log(`🔄 Executing ${operationType} migration: ${migrationName}`);
            
            if (isJsFile) {
                // For JavaScript migrations
                try {
                    // Clear require cache to ensure fresh module loading
                    delete require.cache[require.resolve(migrationPath)];
                    
                    // Import the migration module
                    const migrationModule = require(migrationPath);
                    
                    // Execute the up() function
                    if (typeof migrationModule.up === 'function') {
                        await migrationModule.up(database);
                    } else {
                        throw new Error(`Migration ${migrationName} does not export an up() function`);
                    }
                } catch (jsError) {
                    console.error(`❌ Error executing JS migration ${migrationName}:`, jsError);
                    throw jsError;
                }
            } else {
                // For SQL migrations (legacy support)
                // Citește conținutul fișierului
                const sqlContent = await fs.readFile(migrationPath, 'utf8');
                
                // Împarte SQL-ul în comenzi separate
                const sqlCommands = sqlContent
                    .split(';')
                    .map(cmd => cmd.trim())
                    .filter(cmd => cmd.length > 0);

                await database.connect();
                
                // Execută fiecare comandă SQL
                for (const command of sqlCommands) {
                    if (command.trim()) {
                        await database.query(command);
                    }
                }
            }

            const executionTime = Date.now() - startTime;

            // Verifică dacă migrația există deja în tabel
            const exists = await this.migrationExists(migrationName);
            
            if (exists) {
                // Update existing record
                await database.query(
                    `UPDATE ${this.migrationTableName} 
                     SET execution_time_ms = ?, status = 'success', error_message = NULL, executed_at = CURRENT_TIMESTAMP
                     WHERE migration_name = ?`,
                    [executionTime, migrationName]
                );
            } else {
                // Insert new record
                await database.query(
                    `INSERT INTO ${this.migrationTableName} 
                     (migration_name, execution_time_ms, status) 
                     VALUES (?, ?, 'success')`,
                    [migrationName, executionTime]
                );
            }

            console.log(`✅ Migration ${migrationName} completed in ${executionTime}ms`);
            return { success: true, executionTime };
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            
            // Înregistrează eroarea
            try {
                // Verifică dacă migrația există deja în tabel
                const exists = await this.migrationExists(migrationName);
                
                if (exists) {
                    // Update existing record with error
                    await database.query(
                        `UPDATE ${this.migrationTableName} 
                         SET execution_time_ms = ?, status = 'failed', error_message = ?, executed_at = CURRENT_TIMESTAMP
                         WHERE migration_name = ?`,
                        [executionTime, error.message, migrationName]
                    );
                } else {
                    // Insert new record with error
                    await database.query(
                        `INSERT INTO ${this.migrationTableName} 
                         (migration_name, execution_time_ms, status, error_message) 
                         VALUES (?, ?, 'failed', ?)`,
                        [migrationName, executionTime, error.message]
                    );
                }
            } catch (logError) {
                console.error('❌ Error logging migration failure:', logError);
            }

            console.error(`❌ Migration ${migrationName} failed:`, error.message);
            throw error;
        }
    }

    // Obține toate migrațiile din tabel indiferent de status
    async getAllMigrationRecords() {
        try {
            await database.connect();
            const result = await database.query(
                `SELECT migration_name, status FROM ${this.migrationTableName}`
            );
            return result;
        } catch (error) {
            console.error('❌ Error getting all migration records:', error);
            return [];
        }
    }
    
    // Rulează toate migrațiile pendente
    async runPendingMigrations() {
        try {
            console.log('🚀 Starting database migration check...');
            
            // Creează tabelul de tracking dacă nu există
            await this.createMigrationTable();

            // Obține migrațiile executate, toate înregistrările și fișierele disponibile
            const [executedMigrations, allMigrationRecords, migrationFiles] = await Promise.all([
                this.getExecutedMigrations(),
                this.getAllMigrationRecords(),
                this.getMigrationFiles()
            ]);
            
            // Creează un map cu toate înregistrările de migrații și statusul lor
            const migrationRecordMap = {};
            allMigrationRecords.forEach(record => {
                migrationRecordMap[record.migration_name] = record.status;
            });

            // Filtrează migrațiile pendente (cele care nu sunt marcate ca 'success')
            const pendingMigrations = migrationFiles.filter(migration => {
                // Nu rulăm migrația dacă e deja marcată ca 'success'
                return !executedMigrations.includes(migration.name);
            });

            if (pendingMigrations.length === 0) {
                console.log('✅ All migrations are up to date');
                return { success: true, executed: 0 };
            }

            console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
            pendingMigrations.forEach(migration => {
                const migrationDisplay = migration.type 
                    ? `${migration.type}/${path.basename(migration.path)}`
                    : path.basename(migration.path);
                console.log(`   - ${migrationDisplay}`);
            });

            let executedCount = 0;
            let totalTime = 0;

            // Execute migrations in order: create first, then insert, update, etc.
            // Group migrations by type
            const typeOrder = ['create', 'insert', 'update', 'alter', 'delete'];
            const migrationsByType = {};
            
            for (const migration of pendingMigrations) {
                const type = typeof migration === 'string' ? 'script' : migration.type;
                if (!migrationsByType[type]) {
                    migrationsByType[type] = [];
                }
                migrationsByType[type].push(migration);
            }
            
            // Execute scripts first (legacy), then operations in order
            const scriptMigrations = migrationsByType['script'] || [];
            for (const migration of scriptMigrations) {
                const result = await this.executeMigration(migration);
                if (result.success) {
                    executedCount++;
                    totalTime += result.executionTime;
                }
            }
            
            // Execute operations in the defined order
            for (const type of typeOrder) {
                const typeMigrations = migrationsByType[type] || [];
                for (const migration of typeMigrations) {
                    const result = await this.executeMigration(migration);
                    if (result.success) {
                        executedCount++;
                        totalTime += result.executionTime;
                    }
                }
            }

            console.log(`🎉 Successfully executed ${executedCount} migrations in ${totalTime}ms`);
            return { success: true, executed: executedCount, totalTime };

        } catch (error) {
            console.error('❌ Migration process failed:', error);
            throw error;
        }
    }

    // Funcție pentru rollback (în caz de probleme)
    async rollbackLastMigration() {
        try {
            await database.connect();
            const lastMigration = await database.query(
                `SELECT migration_name FROM ${this.migrationTableName} 
                 WHERE status = 'success' 
                 ORDER BY executed_at DESC 
                 LIMIT 1`
            );

            if (lastMigration.length === 0) {
                console.log('⚠️ No migrations to rollback');
                return false;
            }

            const migrationName = lastMigration[0].migration_name;
            console.log(`🔄 Rolling back migration: ${migrationName}`);

            // Try to find the migration file
            const migrationFiles = await this.getMigrationFiles();
            const migrationFile = migrationFiles.find(m => m.name === migrationName);
            
            if (migrationFile && migrationFile.path.endsWith('.js')) {
                // If it's a JS file, use the down() method
                try {
                    // Clear require cache to ensure fresh module loading
                    delete require.cache[require.resolve(migrationFile.path)];
                    
                    // Import the migration module
                    const migrationModule = require(migrationFile.path);
                    
                    // Execute the down() function if it exists
                    if (typeof migrationModule.down === 'function') {
                        await migrationModule.down(database);
                    } else {
                        console.warn(`⚠️ Migration ${migrationName} does not export a down() function`);
                    }
                } catch (jsError) {
                    console.error(`❌ Error rolling back JS migration ${migrationName}:`, jsError);
                    throw jsError;
                }
            }

            // Marchează migrația ca rolled back
            await database.query(
                `UPDATE ${this.migrationTableName} 
                 SET status = 'rolled_back' 
                 WHERE migration_name = ?`,
                [migrationName]
            );

            console.log(`✅ Rolled back migration: ${migrationName}`);
            return true;

        } catch (error) {
            console.error('❌ Rollback failed:', error);
            throw error;
        }
    }

    // Obține statusul migrațiilor
    async getMigrationStatus() {
        try {
            await database.connect();
            const result = await database.query(
                `SELECT migration_name, executed_at, execution_time_ms, status, error_message 
                 FROM ${this.migrationTableName} 
                 ORDER BY executed_at DESC`
            );
            return result;
        } catch (error) {
            console.error('❌ Error getting migration status:', error);
            return [];
        }
    }
}

module.exports = MigrationManager;
