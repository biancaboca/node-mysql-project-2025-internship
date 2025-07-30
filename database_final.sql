-- Script pentru finalizarea bazei de date
-- Creează tabelul invoices cu structura corectă

-- Creează tabelul invoices cu coloana invoice_id în loc de id pentru a se potrivi cu invoice_items
CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
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

-- Adaugă cheia străină pentru invoices
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_client_id 
FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;

-- Completează permisiunile dacă lipsesc
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

-- Recreează mapările de permisiuni
DELETE FROM role_permissions;

-- Permisiuni pentru CLIENT (doar read pentru majoritatea, create și read pentru appointments)
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

-- Toate permisiunile pentru EMPLOYEE
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'employee';

-- Toate permisiunile pentru ADMIN
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin';

-- Inserează utilizatori de test
INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, code_identify) 
SELECT r.id, 'admin@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADM001'
FROM roles r WHERE r.name = 'admin';

INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, phone, hire_date, department, position, salary) 
SELECT r.id, 'employee@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Doe', '1234567890', '2024-01-01', 'IT', 'Developer', 50000.00
FROM roles r WHERE r.name = 'employee';

INSERT IGNORE INTO users (role_id, email, password, first_name, last_name, phone, birth_date) 
SELECT r.id, 'client@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'Smith', '0987654321', '1990-05-15'
FROM roles r WHERE r.name = 'client';

-- Inserează date pentru inventory
INSERT IGNORE INTO inventory (material_name, stock_quantity, price, supplier, expiry_date) VALUES
('Material A', 100, 25.50, 'Supplier 1', '2025-12-31'),
('Material B', 50, 15.75, 'Supplier 2', '2026-06-30'),
('Material C', 75, 30.00, 'Supplier 1', '2025-09-15');

SELECT 'Database setup completed successfully!' as Result;

-- Afișează sumar al rolurilor și permisiunilor
SELECT 'Role-Permission Summary:' as Info;
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.name;
