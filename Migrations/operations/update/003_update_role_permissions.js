/**
 * Migration: 003_update_role_permissions
 * Description: Updates role permissions for new features and roles
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Add new reporting permissions to admin role
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name = 'admin'
      AND p.name IN ('reports_create', 'reports_read', 'reports_export')
    `);
    
    // Add new reporting read permission to employees
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name = 'employee'
      AND p.name = 'reports_read'
    `);
    
    // Add medical history permissions to appropriate roles
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name IN ('employee', 'admin')
      AND p.name IN ('medical_history_read', 'medical_history_update', 
                     'treatment_plans_create', 'treatment_plans_read', 'treatment_plans_update')
    `);
    
    // Add read-only medical history permission to clients (for their own records)
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name = 'client'
      AND p.name IN ('medical_history_read', 'treatment_plans_read')
    `);
    
    // If manager role exists, configure its permissions
    await db.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r, permissions p
      WHERE r.name = 'manager'
      AND p.name IN (
          'users_create', 'users_read', 'users_update',
          'appointments_create', 'appointments_read', 'appointments_update', 'appointments_delete',
          'inventory_create', 'inventory_read', 'inventory_update', 'inventory_delete',
          'invoices_create', 'invoices_read', 'invoices_update', 'invoices_delete',
          'reports_create', 'reports_read', 'reports_export',
          'medical_history_read', 'medical_history_update',
          'treatment_plans_create', 'treatment_plans_read', 'treatment_plans_update'
      )
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    // Remove permissions for the manager role
    await db.query(`
      DELETE rp FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'manager'
    `);
    
    // Remove medical and reporting permissions from all roles
    await db.query(`
      DELETE rp FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.name IN (
        'reports_create', 'reports_read', 'reports_export',
        'medical_history_read', 'medical_history_update',
        'treatment_plans_create', 'treatment_plans_read', 'treatment_plans_update'
      )
    `);
  }
};
