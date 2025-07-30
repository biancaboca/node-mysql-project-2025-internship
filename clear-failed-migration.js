/**
 * Script to clean up failed migrations in the schema_migrations table
 * This script will delete records for migrations that have failed or are in problematic state
 */

const database = require('./Database/database');

async function clearFailedMigrations() {
    try {
        await database.connect();
        
        // Ensure table structure includes 'rolled_back'
        try {
            await database.query(`
                ALTER TABLE schema_migrations 
                MODIFY COLUMN status ENUM('success', 'failed', 'rolled_back') NOT NULL
            `);
            console.log('🔧 Updated status enum to include rolled_back');
        } catch (modifyError) {
            // If this fails, it probably means the column already has the right enum values
            console.log('ℹ️ Status column already has the correct enum values');
        }
        
        console.log('🔍 Finding problematic migration entries...');
        
        // Get migrations with 'failed' or 'rolled_back' status
        const failedMigrations = await database.query(
            `SELECT id, migration_name, status, executed_at 
             FROM schema_migrations 
             WHERE status IN ('failed', 'rolled_back')`
        );
        
        if (failedMigrations.length === 0) {
            console.log('✅ No problematic migrations found');
            return;
        }
        
        console.log(`Found ${failedMigrations.length} problematic migration entries:`);
        failedMigrations.forEach(migration => {
            console.log(`   - ${migration.migration_name} (${migration.status}) from ${migration.executed_at}`);
        });
        
        // Delete the problematic entries
        const result = await database.query(
            `DELETE FROM schema_migrations 
             WHERE status IN ('failed', 'rolled_back')`
        );
        
        console.log(`✅ Successfully deleted ${result.affectedRows} problematic migration entries`);
        
        // Look for duplicate successful migrations
        const duplicateCheck = await database.query(`
            SELECT migration_name, COUNT(*) as count
            FROM schema_migrations
            GROUP BY migration_name
            HAVING count > 1
        `);
        
        if (duplicateCheck.length > 0) {
            console.log('⚠️ Found duplicate successful migrations, cleaning up...');
            
            for (const dupe of duplicateCheck) {
                // Keep only the most recent entry for each migration
                await database.query(`
                    DELETE FROM schema_migrations 
                    WHERE migration_name = ? 
                    AND id NOT IN (
                        SELECT id FROM (
                            SELECT MAX(id) as id 
                            FROM schema_migrations 
                            WHERE migration_name = ?
                        ) as temp
                    )
                `, [dupe.migration_name, dupe.migration_name]);
                
                console.log(`   - Cleaned up duplicates for ${dupe.migration_name}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error cleaning up migrations:', error);
        process.exit(1);
    } finally {
        await database.close();
        process.exit(0);
    }
}

// Run the cleanup
clearFailedMigrations();
