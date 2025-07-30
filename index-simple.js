console.log('🔄 DEBUG: Starting application...');
require('dotenv').config();

console.log('📦 DEBUG: Loading modules...');
const express = require('express');
console.log('✅ DEBUG: Express loaded');

const userRoutes = require('./Routes/userRoutes');
console.log('✅ DEBUG: UserRoutes loaded');

const app = express();
console.log('✅ DEBUG: Express app created');

// Middleware for JSON
app.use(express.json());
console.log('✅ DEBUG: JSON middleware added');

// Import and connect routes
app.use('/api/users', userRoutes);
console.log('✅ DEBUG: Routes connected');

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'Dental Clinic Management System API',
        version: '2.0.0',
        status: 'Running'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});
console.log('✅ DEBUG: Routes defined');

const PORT = process.env.PORT || 3000;
console.log('🚀 DEBUG: Starting server on port', PORT);

const server = app.listen(PORT, () => {
    console.log('✅ SUCCESS: Server running on port', PORT);
    console.log('📍 Visit: http://localhost:' + PORT);
    console.log('🎉 Application ready!');
});

console.log('📝 DEBUG: Server setup complete');
