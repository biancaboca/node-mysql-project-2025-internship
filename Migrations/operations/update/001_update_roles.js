/**
 * Migration: 001_update_roles
 * Description: Updates to the roles table
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Update role descriptions
    await db.query(`
      UPDATE roles SET description = 'Patient role with access to their own appointments and records' 
      WHERE name = 'client'
    `);
    
    await db.query(`
      UPDATE roles SET description = 'Staff role with access to patient records and appointment management' 
      WHERE name = 'employee'
    `);
    
    await db.query(`
      UPDATE roles SET description = 'Administrator role with full system access and management capabilities' 
      WHERE name = 'admin'
    `);
    
    // Add new manager role
    await db.query(`
      INSERT IGNORE INTO roles (name, description)
      VALUES ('manager', 'Clinic manager role with administrative access but limited system configuration capabilities')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    // Restore original descriptions
    await db.query(`
      UPDATE roles SET description = 'Client role with limited permissions' 
      WHERE name = 'client'
    `);
    
    await db.query(`
      UPDATE roles SET description = 'Employee role with moderate permissions' 
      WHERE name = 'employee'
    `);
    
    await db.query(`
      UPDATE roles SET description = 'Administrator role with full permissions' 
      WHERE name = 'admin'
    `);
    
    // Remove the manager role
    await db.query(`
      DELETE FROM roles WHERE name = 'manager'
    `);
  }
};
