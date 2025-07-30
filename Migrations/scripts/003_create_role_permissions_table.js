/**
 * Migration: 003_create_role_permissions_table
 * Description: Creates the role_permissions junction table and assigns default permissions
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Create role_permissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_role_permission (role_id, permission_id),
        INDEX idx_role (role_id),
        INDEX idx_permission (permission_id),
        
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);
    
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
    
    // Assign all permissions to EMPLOYEE role
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id) 
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name = 'employee'
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
    await db.query(`DROP TABLE IF EXISTS role_permissions`);
  }
};
