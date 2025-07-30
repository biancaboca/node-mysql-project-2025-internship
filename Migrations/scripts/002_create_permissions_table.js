/**
 * Migration: 002_create_permissions_table
 * Description: Creates the permissions table with CRUD permissions for each resource
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Create permissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_resource (resource),
        INDEX idx_action (action),
        INDEX idx_resource_action (resource, action)
      )
    `);
    
    // Insert default permissions
    await db.query(`
      INSERT IGNORE INTO permissions (name, resource, action, description) VALUES 
      -- Permissions for appointments
      ('appointments_create', 'appointments', 'CREATE', 'Can create appointments'),
      ('appointments_read', 'appointments', 'READ', 'Can read appointments'),
      ('appointments_update', 'appointments', 'UPDATE', 'Can update appointments'),
      ('appointments_delete', 'appointments', 'DELETE', 'Can delete appointments'),
      
      -- Permissions for clients
      ('clients_create', 'clients', 'CREATE', 'Can create clients'),
      ('clients_read', 'clients', 'READ', 'Can read clients'),
      ('clients_update', 'clients', 'UPDATE', 'Can update clients'),
      ('clients_delete', 'clients', 'DELETE', 'Can delete clients'),
      
      -- Permissions for employees
      ('employees_create', 'employees', 'CREATE', 'Can create employees'),
      ('employees_read', 'employees', 'READ', 'Can read employees'),
      ('employees_update', 'employees', 'UPDATE', 'Can update employees'),
      ('employees_delete', 'employees', 'DELETE', 'Can delete employees'),
      
      -- Permissions for inventory
      ('inventory_create', 'inventory', 'CREATE', 'Can create inventory items'),
      ('inventory_read', 'inventory', 'READ', 'Can read inventory'),
      ('inventory_update', 'inventory', 'UPDATE', 'Can update inventory'),
      ('inventory_delete', 'inventory', 'DELETE', 'Can delete inventory items'),
      
      -- Permissions for invoices
      ('invoices_create', 'invoices', 'CREATE', 'Can create invoices'),
      ('invoices_read', 'invoices', 'READ', 'Can read invoices'),
      ('invoices_update', 'invoices', 'UPDATE', 'Can update invoices'),
      ('invoices_delete', 'invoices', 'DELETE', 'Can delete invoices')
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
