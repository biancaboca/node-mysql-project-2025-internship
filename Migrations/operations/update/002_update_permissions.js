/**
 * Migration: 002_update_permissions
 * Description: Updates and adds permissions to support new features
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Update descriptions for existing permissions
    await db.query(`
      UPDATE permissions SET description = 'View user profiles and basic information' 
      WHERE name = 'users_read'
    `);
    
    await db.query(`
      UPDATE permissions SET description = 'Create new user accounts and initial setup' 
      WHERE name = 'users_create'
    `);
    
    await db.query(`
      UPDATE permissions SET description = 'Modify existing user information' 
      WHERE name = 'users_update'
    `);
    
    // Add new reporting permissions
    await db.query(`
      INSERT IGNORE INTO permissions (name, description, resource, action) VALUES
      ('reports_create', 'Generate new reports', 'reports', 'CREATE'),
      ('reports_read', 'View system reports', 'reports', 'READ'),
      ('reports_export', 'Export reports to different formats', 'reports', 'UPDATE')
    `);
    
    // Add patient-specific permissions
    await db.query(`
      INSERT IGNORE INTO permissions (name, description, resource, action) VALUES
      ('medical_history_read', 'View patient medical history', 'medical_history', 'READ'),
      ('medical_history_update', 'Update patient medical history', 'medical_history', 'UPDATE'),
      ('treatment_plans_create', 'Create patient treatment plans', 'treatment_plans', 'CREATE'),
      ('treatment_plans_read', 'View patient treatment plans', 'treatment_plans', 'READ'),
      ('treatment_plans_update', 'Update patient treatment plans', 'treatment_plans', 'UPDATE')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    // Restore original permission descriptions
    await db.query(`
      UPDATE permissions SET description = 'View user information' 
      WHERE name = 'users_read'
    `);
    
    await db.query(`
      UPDATE permissions SET description = 'Create new user accounts' 
      WHERE name = 'users_create'
    `);
    
    await db.query(`
      UPDATE permissions SET description = 'Update user accounts' 
      WHERE name = 'users_update'
    `);
    
    // Remove added permissions
    await db.query(`
      DELETE FROM permissions 
      WHERE name IN (
        'reports_create', 'reports_read', 'reports_export',
        'medical_history_read', 'medical_history_update',
        'treatment_plans_create', 'treatment_plans_read', 'treatment_plans_update'
      )
    `);
  }
};
