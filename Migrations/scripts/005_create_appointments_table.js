/**
 * Migration: 005_create_appointments_table
 * Description: Creates the appointments table for dental clinic booking system
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Create appointments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        employee_id INT,
        service_name VARCHAR(255) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration INT DEFAULT 60 COMMENT 'Duration in minutes',
        status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
        price DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_client (client_id),
        INDEX idx_employee (employee_id),
        INDEX idx_date (appointment_date),
        INDEX idx_time (appointment_time),
        INDEX idx_status (status),
        INDEX idx_datetime (appointment_date, appointment_time),
        
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Insert sample appointments
    await db.query(`
      INSERT IGNORE INTO appointments (client_id, employee_id, service_name, appointment_date, appointment_time, duration, status, price, notes)
      SELECT 
          c.id as client_id,
          e.id as employee_id,
          'Dental Check-up & Cleaning',
          '2025-01-30',
          '10:00:00',
          60,
          'scheduled',
          120.00,
          'Regular check-up and professional cleaning'
      FROM users c, users e, roles cr, roles er
      WHERE c.role_id = cr.id AND cr.name = 'client' 
      AND e.role_id = er.id AND er.name = 'employee'
      LIMIT 1
    `);
    
    await db.query(`
      INSERT IGNORE INTO appointments (client_id, employee_id, service_name, appointment_date, appointment_time, duration, status, price, notes) 
      SELECT 
          c.id as client_id,
          e.id as employee_id,
          'Root Canal Treatment',
          '2025-01-31',
          '14:30:00',
          90,
          'confirmed',
          350.00,
          'Upper right molar, patient reported sensitivity'
      FROM users c, users e, roles cr, roles er
      WHERE c.role_id = cr.id AND cr.name = 'client' 
      AND e.role_id = er.id AND er.name = 'employee'
      LIMIT 1
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS appointments`);
  }
};
