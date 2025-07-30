/**
 * Migration: 005_update_appointments
 * Description: Updates appointment information and statuses
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Update completed appointment information with additional notes
    await db.query(`
      UPDATE appointments SET 
          description = CONCAT(description, ' - Patient reported sensitivity after procedure, scheduled follow-up.'),
          price = price * 1.05  -- 5% price adjustment example
      WHERE status = 'completed' 
      AND description LIKE '%Cavity Filling%'
    `);
    
    // Update appointment status for specific appointment based on timing
    await db.query(`
      UPDATE appointments SET 
          status = 'scheduled',  -- Ensuring we use a status that exists in the enum
          description = CONCAT(IFNULL(description, ''), ' - Confirmed via SMS on 2025-07-25.')
      WHERE date > '2025-07-25'  -- Future dates from the current date
      AND status = 'scheduled'
    `);
    
    // Update scheduled appointments with employee assignment
    await db.query(`
      UPDATE appointments SET 
          employee_id = (SELECT id FROM users WHERE email = 'dr.smith@dentalclinic.com' LIMIT 1),
          description = CONCAT(IFNULL(description, ''), ' - Assigned to Dr. Smith.')
      WHERE description LIKE '%Orthodontic Consultation%' 
      AND status = 'scheduled'
    `);
    
    // Update pricing for specific services
    await db.query(`
      UPDATE appointments SET 
          price = 85.00
      WHERE description LIKE '%Dental Checkup%'
      AND date > '2025-06-30'  -- Price increase for future appointments
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    // Restore original appointment information
    await db.query(`
      UPDATE appointments SET 
          description = SUBSTRING_INDEX(description, ' - Patient reported sensitivity', 1),
          price = price / 1.05  -- Reverse 5% price adjustment
      WHERE status = 'completed' 
      AND description LIKE '%Cavity Filling%'
      AND description LIKE '%Patient reported sensitivity%'
    `);
    
    // Restore appointment statuses
    await db.query(`
      UPDATE appointments SET 
          status = 'scheduled',
          description = SUBSTRING_INDEX(description, ' - Confirmed via SMS', 1)
      WHERE date > '2025-07-25'
      AND description LIKE '%Confirmed via SMS%'
    `);
    
    // Restore appointment employee assignment
    await db.query(`
      UPDATE appointments SET 
          employee_id = NULL,
          description = SUBSTRING_INDEX(description, ' - Assigned to Dr. Smith', 1)
      WHERE description LIKE '%Orthodontic Consultation%'
      AND description LIKE '%Assigned to Dr. Smith%'
    `);
    
    // Restore original pricing
    await db.query(`
      UPDATE appointments SET 
          price = 75.00
      WHERE description LIKE '%Dental Checkup%'
      AND date > '2025-06-30'
    `);
  }
};
