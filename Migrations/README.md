# 🗃️ Database Migration System

This migration system ensures your database schema stays consistent and allows you to track changes over time. Each table has its own migration file, making it easy to identify and fix issues quickly.

## 📁 Structure

```
Migrations/
├── MigrationManager.js          # Core migration engine
├── scripts/                     # Individual migration files
│   ├── 001_create_roles_table.sql
│   ├── 002_create_permissions_table.sql
│   ├── 003_create_role_permissions_table.sql
│   ├── 004_create_users_table.sql
│   ├── 005_create_appointments_table.sql
│   ├── 006_create_inventory_table.sql
│   └── 007_create_invoices_table.sql
└── README.md                    # This file
```

## 🚀 Features

- ✅ **Automatic Execution**: Runs on every app startup
- 🔍 **Migration Tracking**: Tracks which migrations have been executed
- ⏱️ **Performance Monitoring**: Records execution time for each migration
- 🛡️ **Error Handling**: Detailed error logging and rollback capability
- 📊 **Status Reporting**: CLI tools for migration management
- 🔄 **Idempotent**: Safe to run multiple times

## 🏃‍♂️ Running Migrations

### Automatic (Recommended)
Migrations run automatically when you start the application:

```bash
node index.js
```

### Manual CLI Commands

```bash
# Run all pending migrations
node migrate.js run

# Check migration status
node migrate.js status

# Rollback last migration
node migrate.js rollback

# Create new migration file
node migrate.js create "add new feature table"
```

## 📋 Migration Files

Each migration file follows this naming convention:
`XXX_description.sql`

- `XXX`: Sequential number (001, 002, etc.)
- `description`: Brief description using underscores

### Example Migration File:

```sql
-- Migration: 008_create_services_table
-- Description: Creates the services table for salon service catalog

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT 'Duration in minutes',
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_category (category),
    INDEX idx_active (active)
);

-- Insert sample data
INSERT IGNORE INTO services (name, description, duration, price, category) VALUES
('Hair Cut', 'Professional hair cutting service', 45, 35.00, 'Hair'),
('Hair Wash & Blow Dry', 'Hair washing and styling', 30, 25.00, 'Hair'),
('Manicure', 'Basic manicure service', 45, 30.00, 'Nails'),
('Pedicure', 'Basic pedicure service', 60, 35.00, 'Nails');
```

## 🔧 Migration Tracking

The system creates a `schema_migrations` table to track:

- ✅ Migration name
- 📅 Execution timestamp
- ⏱️ Execution time
- ✔️ Success/failure status
- 📝 Error messages (if any)

## 🛠️ Best Practices

### 1. **Use IF NOT EXISTS**
Always use `CREATE TABLE IF NOT EXISTS` to make migrations idempotent:

```sql
CREATE TABLE IF NOT EXISTS your_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

### 2. **Use INSERT IGNORE**
For data insertion, use `INSERT IGNORE` to prevent duplicate key errors:

```sql
INSERT IGNORE INTO roles (name, description) VALUES 
('admin', 'Administrator role');
```

### 3. **Add Indexes**
Include relevant indexes in your table creation:

```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    -- ... other columns
    
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);
```

### 4. **Foreign Key Constraints**
Add foreign key constraints for data integrity:

```sql
FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
```

### 5. **Comments**
Add comments to explain complex columns:

```sql
duration INT NOT NULL COMMENT 'Duration in minutes',
status ENUM('active', 'inactive') DEFAULT 'active' COMMENT 'User account status'
```

## 🚨 Error Handling

If a migration fails:

1. **Check the logs** for detailed error messages
2. **Fix the SQL** in the migration file
3. **Restart the application** to retry
4. **Use rollback** if needed: `node migrate.js rollback`

## 📊 Migration Status Example

```
📊 Migration Status:

📋 Executed Migrations:
┌─────────────────────────────────┬─────────────────────┬──────────┬──────────────┐
│ Migration Name                  │ Executed At         │ Status   │ Time (ms)    │
├─────────────────────────────────┼─────────────────────┼──────────┼──────────────┤
│ 001_create_roles_table          │ 2025-01-28 10:30:15│ success  │ 45           │
│ 002_create_permissions_table    │ 2025-01-28 10:30:16│ success  │ 67           │
│ 003_create_role_permissions...  │ 2025-01-28 10:30:17│ success  │ 89           │
│ 004_create_users_table          │ 2025-01-28 10:30:18│ success  │ 123          │
│ 005_create_appointments_table   │ 2025-01-28 10:30:19│ success  │ 156          │
│ 006_create_inventory_table      │ 2025-01-28 10:30:20│ success  │ 234          │
│ 007_create_invoices_table       │ 2025-01-28 10:30:21│ success  │ 178          │
└─────────────────────────────────┴─────────────────────┴──────────┴──────────────┘

✅ No pending migrations
```

## 🔄 Creating New Migrations

When you need to add new features or modify the database:

```bash
# Create a new migration
node migrate.js create "add customer preferences table"

# This creates: Migrations/scripts/20250128103000_add_customer_preferences_table.sql
```

## 🏗️ Development Workflow

1. **Create Migration**: `node migrate.js create "your change"`
2. **Edit SQL File**: Add your SQL statements
3. **Test Migration**: `node migrate.js run`
4. **Check Status**: `node migrate.js status`
5. **Commit Changes**: Add migration file to version control

## 🎯 Benefits

- 🔍 **Early Detection**: Spot database issues quickly
- 📋 **Version Control**: Track database changes over time
- 🚀 **Automated Setup**: New deployments get the correct schema
- 🛡️ **Consistency**: Same database structure across all environments
- 📊 **Monitoring**: Track migration performance and issues

---

🎉 **Your database schema is now managed professionally with full tracking and error detection!**
