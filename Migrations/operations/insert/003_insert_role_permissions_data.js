/**
 * Migration: 003_insert_role_permissions_data
 * Description: Assigns default permissions to roles
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Clear existing permissions to avoid duplicates
    await db.query(`DELETE FROM role_permissions`);
    
    // Assign permissions to CLIENT role (limited access)
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name = 'client' 
      AND (
          p.name = 'appointments_create' OR 
          p.name = 'appointments_read' OR
          p.name = 'clients_read' OR
          p.name = 'inventory_read' OR
          p.name = 'invoices_read'
      )
    `);
    
    // Assign all permissions to EMPLOYEE role except administrative ones
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name = 'employee'
      AND p.name NOT IN ('users_delete', 'roles_update', 'roles_delete', 'permissions_update', 'permissions_delete')
    `);
    
    // Assign all permissions to ADMIN role
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name = 'admin'
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DELETE FROM role_permissions`);
  }
};
