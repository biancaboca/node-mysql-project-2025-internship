/**
 * Debug script for login functionality
 * Run with: node debug-login.js
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const database = require('./Database/database');

const JWT_SECRET = process.env.JWT_SECRET || 'internship2025';

async function debugLogin() {
    try {
        const email = 'admin@dentalclinic.com';
        const password = 'password123';
        
        console.log('1. Starting login debug process');
        console.log(`2. Attempting to login with ${email} and password`);
        
        await database.connect();
        console.log('3. Database connected');
        
        // Get user from database
        const query = `
            SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.phone, 
                   u.birth_date, u.code_identify, u.hire_date, u.department, u.position, u.salary,
                   r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `;
        
        console.log('4. Executing query:', query);
        const result = await database.query(query, [email]);
        
        console.log('5. Query result length:', result?.length);
        
        if (!result || result.length === 0) {
            console.log('ERROR: User not found');
            return;
        }
        
        const user = result[0];
        console.log('6. User found:', { id: user.id, email: user.email, role: user.role });
        
        // Verifică parola
        console.log('7. Password from DB (first 10 chars):', user.password.substring(0, 10) + '...');
        console.log('8. Attempting to compare passwords with bcrypt');
        
        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('9. Password comparison result:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('ERROR: Invalid password');
                return;
            }
            
            // Generate token
            console.log('10. Generating JWT token');
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email,
                    role: user.role
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            console.log('11. JWT token generated successfully');
            console.log('12. Login process completed successfully');
            
        } catch (bcryptError) {
            console.error('ERROR in bcrypt compare:', bcryptError);
        }
        
    } catch (error) {
        console.error('FATAL ERROR in login process:', error);
    } finally {
        await database.close();
    }
}

debugLogin().catch(console.error);
