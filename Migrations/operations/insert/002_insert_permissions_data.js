/**
 * Migration: 002_insert_permissions_data
 * Description: Inserts default permissions for resources in the system
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    await db.query(`
      INSERT IGNORE INTO permissions (name, description, resource, action) VALUES
      -- Users resource permissions
      ('users_create', 'Create new user accounts', 'users', 'CREATE'),
      ('users_read', 'View user information', 'users', 'READ'),
      ('users_update', 'Update user accounts', 'users', 'UPDATE'),
      ('users_delete', 'Delete user accounts', 'users', 'DELETE'),
      
      -- Roles resource permissions
      ('roles_read', 'View roles', 'roles', 'READ'),
      ('roles_create', 'Create new roles', 'roles', 'CREATE'),
      ('roles_update', 'Update roles', 'roles', 'UPDATE'),
      ('roles_delete', 'Delete roles', 'roles', 'DELETE'),
      
      -- Permissions resource permissions
      ('permissions_read', 'View permissions', 'permissions', 'READ'),
      ('permissions_create', 'Create new permissions', 'permissions', 'CREATE'),
      ('permissions_update', 'Update permissions', 'permissions', 'UPDATE'),
      ('permissions_delete', 'Delete permissions', 'permissions', 'DELETE'),
      
      -- Appointments resource permissions
      ('appointments_create', 'Create new appointments', 'appointments', 'CREATE'),
      ('appointments_read', 'View appointments', 'appointments', 'READ'),
      ('appointments_update', 'Update appointments', 'appointments', 'UPDATE'),
      ('appointments_delete', 'Delete appointments', 'appointments', 'DELETE'),
      
      -- Clients resource permissions (specialized view of users)
      ('clients_read', 'View client information', 'clients', 'READ'),
      ('clients_create', 'Create new clients', 'clients', 'CREATE'),
      ('clients_update', 'Update client information', 'clients', 'UPDATE'),
      
      -- Inventory resource permissions
      ('inventory_create', 'Create inventory items', 'inventory', 'CREATE'),
      ('inventory_read', 'View inventory items', 'inventory', 'READ'),
      ('inventory_update', 'Update inventory items', 'inventory', 'UPDATE'),
      ('inventory_delete', 'Delete inventory items', 'inventory', 'DELETE'),
      
      -- Invoices resource permissions
      ('invoices_create', 'Create invoices', 'invoices', 'CREATE'),
      ('invoices_read', 'View invoices', 'invoices', 'READ'),
      ('invoices_update', 'Update invoices', 'invoices', 'UPDATE'),
      ('invoices_delete', 'Delete invoices', 'invoices', 'DELETE')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`
      DELETE FROM permissions 
      WHERE resource IN ('users', 'roles', 'permissions', 'appointments', 'clients', 'inventory', 'invoices')
    `);
  }
};
