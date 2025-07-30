const express = require('express');
const path = require('path');
const database = require('./Database/database');
// Comment out missing route files
// const adminRoutes = require('./Routes/adminRoutes');
// const employeeRoutes = require('./Routes/employeeRoutes');
// const clientRoutes = require('./Routes/clientRoutes');
const inventoryRoutes = require('./Routes/inventoryRoutes');
const appointmentsRoutes = require('./Routes/appointmentsRoutes');
const invoicesRoutes = require('./Routes/invoicesRoutes');
const UserRoutes = require('./Routes/userRoutes');
const FileRoutes = require('./Routes/fileRoutes');

const app = express();
const port = 3000;

// Middleware for JSON and URL encoded forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect routes
// Comment out routes that don't exist
// app.use('/api/admins', new adminRoutes().router);
// app.use('/api/employees', employeeRoutes);
// app.use('/api/clients', clientRoutes);
app.use('/api/inventory', new inventoryRoutes().getRouter());
app.use('/api/appointments', new appointmentsRoutes().getRouter());
app.use('/api/invoices', new invoicesRoutes().getRouter());
app.use('/api/users', new UserRoutes().router);
app.use('/api/files', new FileRoutes().router);

// Serve uploaded files statically
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve file upload test page
app.get('/test-upload', (req, res) => {
    res.sendFile(path.join(__dirname, 'uploads', 'test-upload.html'));
});

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'Salon Management System API',
        endpoints: {
            employees: {
                'GET /api/employees/all': 'Get all employees',
                'POST /api/employees/create': 'Create employee',
                'POST /api/employees/create-table': 'Create employees table',
                'DELETE /api/employees/delete/:id': 'Delete employee by ID',
                'GET /api/employees/export': 'Export employees to file'
            },
            clients: {
                'GET /api/clients/all': 'Get all clients',
                'POST /api/clients/create': 'Create client',
                'POST /api/clients/create-table': 'Create clients table',
                'DELETE /api/clients/delete/:id': 'Delete client by ID',
                'GET /api/clients/export': 'Export clients to file'
            },
            inventory: {
                'GET /api/inventory/all': 'Get all items',
                'POST /api/inventory/add': 'Add new item',
                'PUT /api/inventory/update/:id': 'Update item',
                'DELETE /api/inventory/delete/:id': 'Delete item',
                'GET /api/inventory/item/:id': 'Get specific item',
                'GET /api/inventory/low-stock': 'Get low stock items'
            },
            appointments: {
                'GET /api/appointments/all': 'Get all appointments',
                'POST /api/appointments/create': 'Create appointment',
                'PUT /api/appointments/update/:id': 'Update appointment',
                'DELETE /api/appointments/delete/:id': 'Delete appointment',
                'GET /api/appointments/client/:clientId': 'Get client appointments',
                'GET /api/appointments/employee/:employeeId': 'Get employee appointments',
                'GET /api/appointments/date/:date': 'Get appointments by date'
            },
            invoices: {
                'GET /api/invoices/all': 'Get all invoices',
                'POST /api/invoices/create': 'Create invoice',
                'PUT /api/invoices/update/:id': 'Update invoice',
                'DELETE /api/invoices/delete/:id': 'Delete invoice',
                'GET /api/invoices/client/:clientId': 'Get client invoices',
                'GET /api/invoices/status/:status': 'Get invoices by status',
                'POST /api/invoices/check-overdue': 'Check and update overdue invoices'
            },
            files: {
                'POST /api/files/upload': 'Upload a single file',
                'POST /api/files/upload-multiple': 'Upload multiple files (up to 5)',
                'GET /api/files': 'Get all files for current user',
                'GET /api/files/:id': 'Get a specific file',
                'DELETE /api/files/:id': 'Delete a file'
            }
        }
    });
});

// Pornește serverul
async function startServer() {
    try {
        await database.connect();
        console.log('Database connected successfully!');
        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
            console.log('\n=== Available Endpoints ===');
            console.log('\nEmployees:');
            console.log('- GET  /api/employees/all');
            console.log('- POST /api/employees/create');
            
            console.log('\nClients:');
            console.log('- GET  /api/clients/all');
            console.log('- POST /api/clients/create');
            
            console.log('\nInventory:');
            console.log('- GET  /api/inventory/all');
            console.log('- POST /api/inventory/add');
            console.log('- GET  /api/inventory/low-stock');
            
            console.log('\nAppointments:');
            console.log('- GET  /api/appointments/all');
            console.log('- POST /api/appointments/create');
            console.log('- GET  /api/appointments/date/:date');
            
            console.log('\nInvoices:');
            console.log('- GET  /api/invoices/all');
            console.log('- POST /api/invoices/create');
            console.log('- POST /api/invoices/check-overdue');
            
            console.log('\nFiles:');
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

startServer();