/**
 * Migration: 004_insert_users_data
 * Description: Inserts sample users for dental clinic system
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} db - Database connection
   */
  async up(db) {
    // Admin users
    await db.query(`
      INSERT IGNORE INTO users 
        (role_id, email, password, first_name, last_name, phone, birth_date, code_identify, hire_date, department, position, salary)
      VALUES
        -- Admin users - Using bcrypt hashed password for 'password123' 
        ((SELECT id FROM roles WHERE name = 'admin'), 
         'admin@dentalclinic.com', 
         '$2b$10$3xy51vxlHguaADLIKy3RNu85iUZNZoLkEQCNICiCjjdGMsyj9Ws0O', 
         'Admin', 
         'User', 
         '555-1000', 
         '1980-01-15', 
         'ADM001', 
         '2020-01-01', 
         'Administration', 
         'System Administrator', 
         85000.00)
    `);

    // Employee users (dental staff)
    await db.query(`
      INSERT IGNORE INTO users 
        (role_id, email, password, first_name, last_name, phone, birth_date, code_identify, hire_date, department, position, salary)
      VALUES
        -- Dentists
        ((SELECT id FROM roles WHERE name = 'employee'), 
         'dr.smith@dentalclinic.com', 
         '$2b$10$ZX3difq9c1QOcxp8hwiuXu2jtlKL0LouBDPKMbYmirqiX6UYtzHXC', 
         'John', 
         'Smith', 
         '555-1001', 
         '1975-05-20', 
         'DEN001', 
         '2020-02-01', 
         'Dental', 
         'Senior Dentist', 
         125000.00),
         
        ((SELECT id FROM roles WHERE name = 'employee'), 
         'dr.johnson@dentalclinic.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Emily', 
         'Johnson', 
         '555-1002', 
         '1982-08-15', 
         'DEN002', 
         '2020-03-01', 
         'Dental', 
         'Dentist', 
         115000.00),
         
        -- Dental Hygienists
        ((SELECT id FROM roles WHERE name = 'employee'), 
         'sarah.williams@dentalclinic.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Sarah', 
         'Williams', 
         '555-1003', 
         '1988-11-12', 
         'HYG001', 
         '2020-02-15', 
         'Dental', 
         'Dental Hygienist', 
         75000.00),
         
        -- Receptionist
        ((SELECT id FROM roles WHERE name = 'employee'), 
         'receptionist@dentalclinic.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Michael', 
         'Brown', 
         '555-1004', 
         '1990-04-25', 
         'REC001', 
         '2020-01-15', 
         'Administration', 
         'Receptionist', 
         55000.00)
    `);

    // Client users
    await db.query(`
      INSERT IGNORE INTO users 
        (role_id, email, password, first_name, last_name, phone, birth_date, code_identify)
      VALUES
        -- Regular clients
        ((SELECT id FROM roles WHERE name = 'client'), 
         'alice@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Alice', 
         'Cooper', 
         '555-2001', 
         '1992-03-15', 
         'PAT001'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'bob@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Bob', 
         'Roberts', 
         '555-2002', 
         '1985-07-22', 
         'PAT002'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'carol@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Carol', 
         'Martinez', 
         '555-2003', 
         '1978-12-10', 
         'PAT003'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'david@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'David', 
         'Johnson', 
         '555-2004', 
         '1990-05-05', 
         'PAT004'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'elena@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Elena', 
         'Garcia', 
         '555-2005', 
         '1995-09-18', 
         'PAT005'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'frank@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Frank', 
         'Wilson', 
         '555-2006', 
         '1982-02-28', 
         'PAT006'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'grace@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Grace', 
         'Lee', 
         '555-2007', 
         '1988-11-12', 
         'PAT007'),
         
        ((SELECT id FROM roles WHERE name = 'client'), 
         'henry@yahoo.com', 
         '$2b$10$aqjJ5it.un8rZqLSGxlJXOAMjydh.9kV3O0ZS5rUJTPTCcVpzLwMy', 
         'Henry', 
         'Taylor', 
         '555-2008', 
         '1970-08-30', 
         'PAT008')
    `);
  },
  
  /**
   * Revert the migration
   * @param {Object} db - Database connection
   */
  async down(db) {
    await db.query(`
      DELETE FROM users 
      WHERE email IN (
        'admin@dentalclinic.com',
        'dr.smith@dentalclinic.com',
        'dr.johnson@dentalclinic.com',
        'sarah.williams@dentalclinic.com',
        'receptionist@dentalclinic.com',
        'alice@example.com',
        'bob@example.com',
        'carol@example.com',
        'david@example.com',
        'elena@example.com',
        'frank@example.com',
        'grace@example.com',
        'henry@example.com'
      )
    `);
  }
};
