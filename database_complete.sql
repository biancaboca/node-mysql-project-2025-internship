-- Script de completare pentru baza de date
-- Verifică și completează structura necesară

-- Verifică dacă tabelul invoices există, dacă nu îl creează
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    deadline DATE,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    items JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
);

-- Adaugă cheia străină pentru invoices dacă nu există
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'test_db' 
    AND TABLE_NAME = 'invoices' 
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    AND CONSTRAINT_NAME LIKE '%client_id%'
);

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE invoices ADD CONSTRAINT fk_invoices_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Inserează date de test dacă nu există

-- Inserează roluri dacă nu există
INSERT IGNORE INTO roles (name, description) VALUES 
('client', 'Client role with limited permissions'),
('employee', 'Employee role with moderate permissions'),
('admin', 'Administrator role with full permissions');

-- Verifică și inserează permisiuni dacă nu există
INSERT IGNORE INTO permissions (name, resource, action, description) VALUES 
-- Permissions for appointments
('appointments_create', 'appointments', 'CREATE', 'Can create appointments'),
('appointments_read', 'appointments', 'READ', 'Can read appointments'),
('appointments_update', 'appointments', 'UPDATE', 'Can update appointments'),
('appointments_delete', 'appointments', 'DELETE', 'Can delete appointments'),

-- Permissions for clients
('clients_create', 'clients', 'CREATE', 'Can create clients'),
('clients_read', 'clients', 'READ', 'Can read clients'),
('clients_update', 'clients', 'UPDATE', 'Can update clients'),
('clients_delete', 'clients', 'DELETE', 'Can delete clients'),

-- Permissions for employees
('employees_create', 'employees', 'CREATE', 'Can create employees'),
('employees_read', 'employees', 'READ', 'Can read employees'),
('employees_update', 'employees', 'UPDATE', 'Can update employees'),
('employees_delete', 'employees', 'DELETE', 'Can delete employees'),

-- Permissions for inventory
('inventory_create', 'inventory', 'CREATE', 'Can create inventory items'),
('inventory_read', 'inventory', 'READ', 'Can read inventory'),
('inventory_update', 'inventory', 'UPDATE', 'Can update inventory'),
('inventory_delete', 'inventory', 'DELETE', 'Can delete inventory items'),

-- Permissions for invoices
('invoices_create', 'invoices', 'CREATE', 'Can create invoices'),
('invoices_read', 'invoices', 'READ', 'Can read invoices'),
('invoices_update', 'invoices', 'UPDATE', 'Can update invoices'),
('invoices_delete', 'invoices', 'DELETE', 'Can delete invoices');

-- Șterge permisiunile existente pentru roluri pentru a le recrea
DELETE FROM role_permissions;

-- Atribuie permisiuni pentru CLIENT (doar read pentru majoritatea, create și read pentru appointments)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'client' 
AND (
    p.name = 'appointments_create' OR 
    p.name = 'appointments_read' OR
    p.name = 'clients_read' OR
    p.name = 'inventory_read' OR
    p.name = 'invoices_read'
);

-- Atribuie toate permisiunile CRUD pentru EMPLOYEE
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'employee';

-- Atribuie toate permisiunile CRUD pentru ADMIN
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin';

-- Inserează utilizatori de test dacă nu există
INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, code_identify) 
SELECT r.id, 'admin@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADM001'
FROM roles r WHERE r.name = 'admin';

INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, phone, hire_date, department, position, salary) 
SELECT r.id, 'employee@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Doe', '1234567890', '2024-01-01', 'IT', 'Developer', 50000.00
FROM roles r WHERE r.name = 'employee';

INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, phone, birth_date) 
SELECT r.id, 'client@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'Smith', '0987654321', '1990-05-15'
FROM roles r WHERE r.name = 'client';

-- Inserează date de test pentru inventory dacă nu există
INSERT IGNORE INTO inventory (material_name, stock_quantity, price, supplier, expiry_date) VALUES
('Material A', 100, 25.50, 'Supplier 1', '2025-12-31'),
('Material B', 50, 15.75, 'Supplier 2', '2026-06-30'),
('Material C', 75, 30.00, 'Supplier 1', '2025-09-15');

COMMIT;

-- Afișează rezultatul final
SELECT 'Database setup completed successfully!' as Status;

-- Afișează structura rolurilor și permisiunilor
SELECT 'Roles and Permissions Summary:' as Info;
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
