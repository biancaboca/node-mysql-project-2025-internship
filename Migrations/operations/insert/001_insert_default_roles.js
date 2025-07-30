/**
 * Migration: 001_insert_default_roles
 * Description: Insert default roles into the roles table
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
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
    await db.query(`
      DELETE FROM roles WHERE name IN ('client', 'employee', 'admin')
    `);
  }
};
