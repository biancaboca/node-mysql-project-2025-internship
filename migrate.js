#!/usr/bin/env node

/**
 * Migration CLI Tool
 * 
 * Usage:
 * node migrate.js run           - Run all pending migrations
 * node migrate.js status        - Show migration status
 * node migrate.js rollback      - Rollback last migration
 * node migrate.js create <name> - Create new migration file
 */

const MigrationManager = require('./Migrations/MigrationManager');
const fs = require('fs').promises;
const path = require('path');

class MigrationCLI {
    constructor() {
        this.migrationManager = new MigrationManager();
    }

    async run() {
        const command = process.argv[2];
        const param = process.argv[3];

        try {
            switch (command) {
                case 'run':
                    await this.runMigrations();
                    break;
                case 'status':
                    await this.showStatus();
                    break;
                case 'rollback':
                    await this.rollback();
                    break;
                case 'create':
                    if (!param) {
                        console.error('❌ Migration name is required. Usage: node migrate.js create <name>');
                        process.exit(1);
                    }
                    await this.createMigration(param);
                    break;
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error('❌ Command failed:', error.message);
            process.exit(1);
        }
    }

    async runMigrations() {
        console.log('🚀 Running database migrations...');
        const result = await this.migrationManager.runPendingMigrations();
        
        if (result.success) {
            if (result.executed > 0) {
                console.log(`✅ Successfully executed ${result.executed} migrations in ${result.totalTime}ms`);
            } else {
                console.log('✅ All migrations are up to date');
            }
        } else {
            console.error('❌ Migrations failed');
            process.exit(1);
        }
    }

    async showStatus() {
        console.log('📊 Migration Status:');
        
        // Get migration status
        const status = await this.migrationManager.getMigrationStatus();
        
        if (status.length === 0) {
            console.log('   No migrations have been executed yet');
            return;
        }

        console.log('\n📋 Executed Migrations:');
        console.log('┌─────────────────────────────────┬─────────────────────┬──────────┬──────────────┐');
        console.log('│ Migration Name                  │ Executed At         │ Status   │ Time (ms)    │');
        console.log('├─────────────────────────────────┼─────────────────────┼──────────┼──────────────┤');
        
        status.forEach(migration => {
            const name = migration.migration_name.padEnd(31);
            const date = new Date(migration.executed_at).toLocaleString().padEnd(19);
            const statusText = migration.status.padEnd(8);
            const time = migration.execution_time_ms.toString().padEnd(12);
            
            console.log(`│ ${name} │ ${date} │ ${statusText} │ ${time} │`);
        });
        
        console.log('└─────────────────────────────────┴─────────────────────┴──────────┴──────────────┘');

        // Show pending migrations
        const migrationFiles = await this.migrationManager.getMigrationFiles();
        const executedMigrations = await this.migrationManager.getExecutedMigrations();
        const pendingMigrations = migrationFiles.filter(file => {
            const migrationName = path.basename(file, '.sql');
            return !executedMigrations.includes(migrationName);
        });

        if (pendingMigrations.length > 0) {
            console.log(`\n⏳ Pending Migrations (${pendingMigrations.length}):`);
            pendingMigrations.forEach(migration => {
                console.log(`   - ${path.basename(migration, '.sql')}`);
            });
        } else {
            console.log('\n✅ No pending migrations');
        }
    }

    async rollback() {
        console.log('🔄 Rolling back last migration...');
        const result = await this.migrationManager.rollbackLastMigration();
        
        if (result) {
            console.log('✅ Migration rolled back successfully');
        } else {
            console.log('⚠️ No migrations to rollback');
        }
    }

    async createMigration(name) {
        const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').substring(0, 14);
        const filename = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
        const filepath = path.join(__dirname, 'Migrations', 'scripts', filename);
        
        const template = `-- Migration: ${filename.replace('.sql', '')}
-- Description: ${name}

-- Add your SQL statements here
-- Example:
-- CREATE TABLE IF NOT EXISTS your_table (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- INSERT INTO your_table (name) VALUES ('example');`;

        try {
            await fs.writeFile(filepath, template, 'utf8');
            console.log(`✅ Created migration file: ${filename}`);
            console.log(`📄 Path: ${filepath}`);
            console.log('\n💡 Edit the file to add your SQL statements, then run: node migrate.js run');
        } catch (error) {
            console.error('❌ Error creating migration file:', error.message);
            throw error;
        }
    }

    showHelp() {
        console.log('🗃️  Database Migration CLI Tool');
        console.log('\nUsage:');
        console.log('  node migrate.js run              - Run all pending migrations');
        console.log('  node migrate.js status           - Show migration status');
        console.log('  node migrate.js rollback         - Rollback last migration');
        console.log('  node migrate.js create <name>    - Create new migration file');
        console.log('\nExamples:');
        console.log('  node migrate.js run');
        console.log('  node migrate.js status');
        console.log('  node migrate.js create "add user preferences table"');
        console.log('\n📚 For more information, check the Migrations/README.md file');
    }
}

// Run the CLI
if (require.main === module) {
    const cli = new MigrationCLI();
    cli.run().catch(error => {
        console.error('❌ CLI Error:', error.message);
        process.exit(1);
    });
}

module.exports = MigrationCLI;
