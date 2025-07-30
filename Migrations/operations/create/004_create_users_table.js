/**
 * Migration: 004_create_users_table
 * Description: Creates the main users table with all necessary fields
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        birth_date DATE,
        code_identify VARCHAR(50),
        hire_date DATE,
        department VARCHAR(100),
        position VARCHAR(100),
        salary DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role_id),
        INDEX idx_code_identify (code_identify),
        INDEX idx_hire_date (hire_date),
        INDEX idx_department (department),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
      )
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS users`);
  }
};
