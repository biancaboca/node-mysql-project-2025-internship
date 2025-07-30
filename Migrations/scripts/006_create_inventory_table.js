/**
 * Migration: 006_create_inventory_table
 * Description: Creates the inventory table for salon supplies and materials
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Drop table if exists
    await db.query(`DROP TABLE IF EXISTS inventory`);
    
    // Create inventory table
    await db.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_name VARCHAR(255) NOT NULL,
        material_description TEXT,
        quantity INT NOT NULL DEFAULT 0,
        minimum_stock INT DEFAULT 10,
        price DECIMAL(10,2),
        unit VARCHAR(50) DEFAULT 'buc',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (material_name),
        INDEX idx_quantity (quantity),
        INDEX idx_minimum_stock (minimum_stock),
        INDEX idx_price (price),
        INDEX idx_unit (unit)
      )
    `);
    
    // Insert sample inventory items
    await db.query(`
      INSERT IGNORE INTO inventory (material_name, material_description, quantity, minimum_stock, price, unit) VALUES
      ('Dental Composite', 'Light-cured composite filling material', 30, 5, 45.99, 'syringes'),
      ('Dental Anesthetic', 'Local anesthetic solution', 50, 10, 28.50, 'cartridges'),
      ('Dental X-Ray Films', 'High-quality digital films', 100, 20, 0.75, 'pieces'),
      ('Dental Cement', 'Glass ionomer cement', 15, 3, 32.75, 'boxes'),
      ('Prophy Paste', 'Teeth cleaning paste', 20, 5, 15.99, 'jars')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS inventory`);
  }
};
