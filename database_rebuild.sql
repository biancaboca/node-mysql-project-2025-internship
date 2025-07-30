-- Script pentru refacerea completă a bazei de date
-- Elimină toate tabelele existente și creează noua structură cu roluri și permisiuni separate

-- Dezactivează verificările de cheie străină temporar
SET FOREIGN_KEY_CHECKS = 0;

-- Șterge toate tabelele existente
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS user_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Reactivează verificările de cheie străină
SET FOREIGN_KEY_CHECKS = 1;

-- Creează tabelul de roluri
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserează rolurile de bază
INSERT INTO roles (name, description) VALUES 
('client', 'Client role with limited permissions'),
('employee', 'Employee role with moderate permissions'),
('admin', 'Administrator role with full permissions');

-- Creează tabelul de permisiuni
CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL, -- pe ce tabel/resursă se aplică
    action VARCHAR(20) NOT NULL, -- CREATE, READ, UPDATE, DELETE
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserează permisiunile pentru toate resursele
INSERT INTO permissions (name, resource, action, description) VALUES 
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

-- Creează tabelul de mapare între roluri și permisiuni
CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Creează tabelul de utilizatori unificat (înlocuiește admins, clients, employees)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    birth_date DATE,
    
    -- Câmpuri specifice pentru admin
    code_identify VARCHAR(100),
    
    -- Câmpuri specifice pentru employee
    hire_date DATE,
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    
    -- Metadate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_role (role_id),
    INDEX idx_email (email)
);

-- Creează tabelul de programări (appointments)
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    price DECIMAL(10,2),
    description TEXT,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_employee (employee_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);

-- Creează tabelul de inventar
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_material_name (material_name),
    INDEX idx_stock_quantity (stock_quantity),
    INDEX idx_expiry_date (expiry_date)
);

-- Creează tabelul de facturi
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    deadline DATE,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    items JSON, -- pentru a stoca lista de articole
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
);

-- Inserează date de test

-- Inserează un admin de test
INSERT INTO users (role_id, email, password, first_name, last_name, code_identify) 
SELECT r.id, 'admin@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'ADM001'
FROM roles r WHERE r.name = 'admin';

-- Inserează un employee de test
INSERT INTO users (role_id, email, password, first_name, last_name, phone, hire_date, department, position, salary) 
SELECT r.id, 'employee@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Doe', '1234567890', '2024-01-01', 'IT', 'Developer', 50000.00
FROM roles r WHERE r.name = 'employee';

-- Inserează un client de test
INSERT INTO users (role_id, email, password, first_name, last_name, phone, birth_date) 
SELECT r.id, 'client@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'Smith', '0987654321', '1990-05-15'
FROM roles r WHERE r.name = 'client';

-- Inserează date de test pentru inventory
INSERT INTO inventory (material_name, stock_quantity, price, supplier, expiry_date) VALUES
('Material A', 100, 25.50, 'Supplier 1', '2025-12-31'),
('Material B', 50, 15.75, 'Supplier 2', '2026-06-30'),
('Material C', 75, 30.00, 'Supplier 1', '2025-09-15');

COMMIT;

-- Afișează informații despre noua structură
SELECT 'Database rebuild completed successfully!' as Status;

-- Afișează tabelele create
SELECT 'Tables created:' as Info;
SHOW TABLES;

-- Afișează rolurile și permisiunile
SELECT 'Roles and their permissions:' as Info;
SELECT r.name as role_name, p.name as permission_name, p.resource, p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
ORDER BY r.name, p.resource, p.action;
