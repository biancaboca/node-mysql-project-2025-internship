/**
 * Rollback script for database migrations
 * This script allows you to roll back the last successful migration
 * 
 * Usage:
 * node rollback.js                - Rolls back the last migration
 * node rollback.js --count 3      - Rolls back the last 3 migrations
 */

const MigrationManager = require('./Migrations/MigrationManager');
const database = require('./Database/database');

async function rollback(count = 1) {
    const manager = new MigrationManager();
    
    try {
        console.log(`🔄 Starting rollback of ${count} migration(s)...`);
        
        // Roll back the specified number of migrations
        let successCount = 0;
        for (let i = 0; i < count; i++) {
            const result = await manager.rollbackLastMigration();
            if (result) {
                successCount++;
            } else {
                console.log('⚠️ No more migrations to roll back');
                break;
            }
        }
        
        console.log(`✅ Successfully rolled back ${successCount} migration(s)`);
    } catch (error) {
        console.error('❌ Rollback failed:', error);
    } finally {
        // Close the database connection
        await database.close();
    }
}

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    let count = 1; // Default to rolling back 1 migration
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--count' && args[i+1]) {
            count = parseInt(args[i+1], 10);
            if (isNaN(count) || count < 1) {
                console.error('❌ Invalid count value. Using default of 1.');
                count = 1;
            }
            break;
        }
    }
    
    return { count };
}

// Run the rollback
const { count } = parseArgs();
rollback(count).catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
