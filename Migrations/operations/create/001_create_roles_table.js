/**
 * Migration: 001_create_roles_table
 * Description: Creates the roles table with basic roles
 */
import { userValidationSchema } from '../../../Validation/userValidation';

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name)
      )
    `);
  },

  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DROP TABLE IF EXISTS roles`);
  },

  /**
   * Validate user data before insertion using Yup schema
   * @param {Object} userData - User data to validate
   * @returns {Object} Validated data
   */
  async validateUserData(userData) {
    try {
      return await userValidationSchema.validate(userData, {
        abortEarly: false,
        stripUnknown: true
      });
    } catch (error) {
      throw {
        type: 'VALIDATION_ERROR',
        errors: error.inner.reduce((acc, err) => {
          acc[err.path] = err.message;
          return acc;
        }, {})
      };
    }
  }
};