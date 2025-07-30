/**
 * Migration: 007_create_invoices_table
 * Description: Creates the invoices table for billing and payment tracking
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Create invoices table
    await db.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        deadline DATE,
        status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
        items JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_client (client_id),
        INDEX idx_date (date),
        INDEX idx_deadline (deadline),
        INDEX idx_status (status),
        INDEX idx_amount (amount),
        
        FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Insert sample invoices
    await db.query(`
      INSERT IGNORE INTO invoices (client_id, amount, date, deadline, status, items) 
      SELECT 
        c.id as client_id,
        120.00,
        '2025-01-25',
        '2025-02-25',
        'pending',
        JSON_OBJECT(
          'services', JSON_ARRAY(
            JSON_OBJECT('name', 'Dental Check-up & Cleaning', 'quantity', 1, 'price', 120.00)
          ),
          'total_services', 1,
          'subtotal', 120.00
        )
      FROM users c, roles cr
      WHERE c.role_id = cr.id AND cr.name = 'client'
      LIMIT 1
    `);
    
    await db.query(`
      INSERT IGNORE INTO invoices (client_id, amount, date, deadline, status, items) 
      SELECT 
        c.id as client_id,
        350.00,
        '2025-01-20',
        '2025-02-20',
        'paid',
        JSON_OBJECT(
          'services', JSON_ARRAY(
            JSON_OBJECT('name', 'Root Canal Treatment', 'quantity', 1, 'price', 350.00)
          ),
          'total_services', 1,
          'subtotal', 350.00
        )
      FROM users c, roles cr
      WHERE c.role_id = cr.id AND cr.name = 'client'
      LIMIT 1
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS invoices`);
  }
};
