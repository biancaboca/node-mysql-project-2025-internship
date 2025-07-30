/**
 * Migration: 001_create_roles_table
 * Description: Creates the roles table with basic roles
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Create roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name)
      )
    `);
    
    // Insert default roles
    await db.query(`
      INSERT IGNORE INTO roles (name, description) VALUES 
      ('client', 'Client role with limited permissions'),
      ('employee', 'Employee role with moderate permissions'),
      ('admin', 'Administrator role with full permissions')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS roles`);
  }
};
