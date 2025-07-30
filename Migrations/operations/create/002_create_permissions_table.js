/**
 * Migration: 002_create_permissions_table
 * Description: Creates the permissions table to store granular permissions
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        resource VARCHAR(50) NOT NULL,
        action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_resource (resource),
        INDEX idx_action (action),
        UNIQUE KEY uk_resource_action (resource, action)
      )
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS permissions`);
  }
};
