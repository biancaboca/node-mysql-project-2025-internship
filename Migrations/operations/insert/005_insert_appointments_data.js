/**
 * Migration: 005_insert_appointments_data
 * Description: Inserts sample data into appointments table
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    await db.query(`
      INSERT INTO appointments 
        (client_id, employee_id, date, time, status, price, description)
      VALUES
        (2, 3, '2023-06-01', '09:00:00', 'completed', 75.00, 'Dental Checkup - Regular 6-month checkup'),
        (2, 4, '2023-06-01', '09:30:00', 'completed', 120.00, 'Teeth Cleaning - Deep cleaning procedure'),
        (3, 3, '2023-06-01', '11:00:00', 'completed', 150.00, 'Cavity Filling - Two small cavities filled'),
        (4, 4, '2023-06-02', '14:00:00', 'completed', 800.00, 'Root Canal - Molar root canal procedure'),
        (5, 3, '2023-06-03', '10:00:00', 'completed', 75.00, 'Dental Checkup - First time patient'),
        (6, 4, '2023-06-05', '13:00:00', 'completed', 250.00, 'Teeth Whitening - Professional whitening treatment'),
        (2, 3, '2023-12-01', '09:00:00', 'scheduled', 75.00, 'Dental Checkup - Follow-up appointment'),
        (3, 4, '2023-12-05', '11:00:00', 'scheduled', 120.00, 'Teeth Cleaning - Regular cleaning'),
        (7, 3, '2023-12-07', '15:00:00', 'scheduled', 100.00, 'Orthodontic Consultation - Braces consultation'),
        (8, 4, '2023-12-10', '14:00:00', 'scheduled', 90.00, 'Wisdom Tooth Evaluation - Checking if extraction is needed')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`DELETE FROM appointments`);
  }
};
