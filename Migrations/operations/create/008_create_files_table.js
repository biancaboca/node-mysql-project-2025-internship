/**
 * Migration to create the files table
 */
const database = require('../../../Database/database');

// Up - Create files table
async function up() {
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        filename VARCHAR(255) NOT NULL,
        originalname VARCHAR(255) NOT NULL,
        path VARCHAR(512) NOT NULL,
        mimetype VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await database.query(createTableSQL);
    
    console.log('Files table created successfully');
    return true;
}

// Down - Drop files table
async function down() {
    const dropTableSQL = 'DROP TABLE IF EXISTS files;';
    
    await database.query(dropTableSQL);
    
    console.log('Files table dropped successfully');
    return true;
}

module.exports = { up, down };
