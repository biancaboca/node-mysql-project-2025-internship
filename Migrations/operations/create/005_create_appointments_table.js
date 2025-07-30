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
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS appointments`);
  }
};
