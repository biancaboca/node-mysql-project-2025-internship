require('dotenv').config();
const userRoutes = require('./Routes/userRoutes');
const AppointmentsRoutes = require('./Routes/appointmentsRoutes');
const inventoryRoutes = require('./Routes/inventoryRoutes');
const invoicesRoutes = require('./Routes/invoicesRoutes');
const FileRoutes = require('./Routes/fileRoutes');
const database = require('./Database/database');
const express = require('express');
const MigrationManager = require('./Migrations/MigrationManager');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const {SMTPClient} = require('emailjs');


console.log('🔄 Starting Dental Clinic Management System...');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
   origin: '*',  // Allows requests from all domains. Specify actual domain in production for security.
   optionsSuccessStatus: 200 // For compatibility, set OPTIONS request success status to 200 OK.
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
console.log('📁 Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    console.log('📂 Creating upload directory');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadDir));

const appointmentsRoutes = new AppointmentsRoutes();

// Manual migration endpoint
app.get('/migrate', async (req, res) => {
  try {
    console.log('🔄 Running manual database migrations...');
    const migrationManager = new MigrationManager();
    await migrationManager.runMigrations();
    res.json({
      success: true,
      message: 'Database migrations completed successfully',
      timestamp: new Date().toISOString()
    });
    console.log('✅ Manual migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Use the consolidated userRoutes for all user-related endpoints
app.use('/api/users', userRoutes); // userRoutes already exports an instance of the router
app.use('/api/appointments', appointmentsRoutes.getRouter());
app.use('/api/inventory', new inventoryRoutes().getRouter()); // Using getRouter method
app.use('/api/invoices', new invoicesRoutes().getRouter()); // Using getRouter method
app.use('/api/files', new FileRoutes().router); // Using router directly

app.get('/', (req, res) => {
  res.json({
    message: 'Dental Clinic Management System API',
    version: '2.0.0',
    endpoints: {
      'GET /': 'API Information',
      'GET /health': 'Health check',
      'GET /migrate': 'Run database migrations manually',
      users: {
        'POST /api/users/login': 'User login (all roles)',
        'POST /api/users/register/admin': 'Register admin',
        'POST /api/users/register/employee': 'Register employee', 
        'POST /api/users/register/client': 'Register client',
        'GET /api/users/profile': 'Get own profile',
        'PUT /api/users/profile': 'Update own profile',
        'GET /api/users/': 'Get all users (admin only)',
        'GET /api/users/role/:role': 'Get users by role',
        'GET /api/users/admins/all': 'Get all admins',
        'GET /api/users/employees/all': 'Get all employees',
        'GET /api/users/clients/all': 'Get all clients',
        'PUT /api/users/:id/change-password': 'Change user password'
      },
      inventory: {
        'GET /api/inventory/all': 'Get all items',
        'POST /api/inventory/add': 'Add new item',
        'PUT /api/inventory/update/:id': 'Update item',
        'DELETE /api/inventory/delete/:id': 'Delete item',
        'GET /api/inventory/item/:id': 'Get specific item',
        'GET /api/inventory/low-stock': 'Get low stock items',
        'POST /api/inventory/create-table': 'Create inventory table'
      },
      appointments: {
        'GET /api/appointments/all': 'Get all appointments',
        'POST /api/appointments/create': 'Create appointment',
        'PUT /api/appointments/update/:id': 'Update appointment',
        'DELETE /api/appointments/delete/:id': 'Delete appointment',
        'GET /api/appointments/client/:clientId': 'Get client appointments',
        'GET /api/appointments/employee/:employeeId': 'Get employee appointments',
        'GET /api/appointments/date/:date': 'Get appointments by date',
        'POST /api/appointments/create-table': 'Create appointments table'
      },
      invoices: {
        'GET /api/invoices/all': 'Get all invoices',
        'POST /api/invoices/create': 'Create invoice',
        'PUT /api/invoices/update/:id': 'Update invoice',
        'DELETE /api/invoices/delete/:id': 'Delete invoice',
        'GET /api/invoices/client/:clientId': 'Get client invoices',
        'GET /api/invoices/status/:status': 'Get invoices by status',
        'POST /api/invoices/check-overdue': 'Check and update overdue invoices',
        'POST /api/invoices/create-table': 'Create invoices table'
      },
      files: {
        'POST /api/files/upload': 'Upload a single file',
        'POST /api/files/upload-multiple': 'Upload multiple files (max 5)',
        'GET /api/files': 'Get all user files',
        'GET /api/files/:id': 'Get file by id',
        'DELETE /api/files/:id': 'Delete file'
      }
    }
  });
});

async function startServer() {
  try {
    console.log('📊 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected successfully');
    
    // Run migrations before starting the server
    try {
      console.log('🔄 Running database migrations...');
      const migrationManager = new MigrationManager();
      await migrationManager.runPendingMigrations();
      console.log(' Database migrations completed successfully');
    } catch (migrationError) {
      console.error(' Migration error:', migrationError);
      console.log(' Starting server despite migration failure...');
    }
    
    app.listen(port, () => {
     

      console.log('\n=== User Endpoints ===');
      console.log('- POST /api/users/login: User login (all roles)');
      console.log('- POST /api/users/register/admin: Register admin');
      console.log('- POST /api/users/register/employee: Register employee');
      console.log('- POST /api/users/register/client: Register client');
      console.log('- GET  /api/users/profile: Get own profile');
      console.log('- PUT  /api/users/profile: Update own profile');
      console.log('- GET  /api/users/: Get all users (admin only)');
      console.log('- GET  /api/users/role/:role: Get users by role');
      console.log('- GET  /api/users/admins/all: Get all admins');
      console.log('- GET  /api/users/employees/all: Get all employees');
      console.log('- GET  /api/users/clients/all: Get all clients');
      console.log('- PUT  /api/users/:id/change-password: Change password');
      console.log('- POST /api/admins/export');

      console.log('\n=== Inventory Endpoints ===');
      console.log('- GET  /api/inventory/all');
      console.log('- POST /api/inventory/add');
      console.log('- PUT  /api/inventory/update/:id');
      console.log('- GET  /api/inventory/low-stock');

      console.log('\n=== Appointment Endpoints ===');
      console.log('- GET  /api/appointments/all');
      console.log('- POST /api/appointments/create');
      console.log('- GET  /api/appointments/date/:date');
      console.log('- GET  /api/appointments/client/:clientId');

      console.log('\n=== Invoice Endpoints ===');
      console.log('- GET  /api/invoices/all');
      console.log('- POST /api/invoices/create');
      console.log('- GET  /api/invoices/client/:clientId');
      console.log('- POST /api/invoices/check-overdue');
      
      console.log('\n=== File Upload Endpoints ===');
      console.log('- POST /api/files/upload');
      console.log('- POST /api/files/upload-multiple');
      console.log('- GET  /api/files');
      console.log('- GET  /api/files/:id');
      console.log('- DELETE /api/files/:id');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await database.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await database.close();
  process.exit(0);
});

startServer();