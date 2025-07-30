/**
 * Migration: 004_update_users
 * Description: Updates to user accounts and adds specialty fields for dental clinic
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Add new manager user if the role exists
    await db.query(`
      INSERT IGNORE INTO users 
          (role_id, email, password, first_name, last_name, phone, birth_date, code_identify, hire_date, department, position, salary)
      SELECT 
          r.id,
          'manager@dentalclinic.com', 
          '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
          'Jennifer', 
          'Clark', 
          '555-1005', 
          '1979-06-12', 
          'MGR001', 
          '2020-01-05', 
          'Administration', 
          'Clinic Manager', 
          90000.00
      FROM roles r 
      WHERE r.name = 'manager'
    `);
    
    // Update specific user information
    await db.query(`
      UPDATE users SET 
          phone = '555-1001-updated', 
          position = 'Lead Dentist',
          salary = 130000.00
      WHERE email = 'dr.smith@dentalclinic.com'
    `);
    
    // Add specialty information to dentists (demonstrates extending user data for specific roles)
    await db.query(`
      UPDATE users SET 
          department = 'Dental - Orthodontics',
          position = 'Orthodontist'
      WHERE email = 'dr.johnson@dentalclinic.com'
    `);
    
    // Update client information
    await db.query(`
      UPDATE users SET 
          phone = '555-2001-updated',
          last_name = 'Cooper-Smith'
      WHERE email = 'alice@example.com'
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    // Remove the manager user
    await db.query(`
      DELETE FROM users WHERE email = 'manager@dentalclinic.com'
    `);
    
    // Restore original user information
    await db.query(`
      UPDATE users SET 
          phone = '555-1001', 
          position = 'Senior Dentist',
          salary = 125000.00
      WHERE email = 'dr.smith@dentalclinic.com'
    `);
    
    await db.query(`
      UPDATE users SET 
          department = 'Dental',
          position = 'Dentist'
      WHERE email = 'dr.johnson@dentalclinic.com'
    `);
    
    await db.query(`
      UPDATE users SET 
          phone = '555-2001',
          last_name = 'Cooper'
      WHERE email = 'alice@example.com'
    `);
  }
};
