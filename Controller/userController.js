const express = require('express');
const database = require('../Database/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../Middleware/authMiddleware');
const { ROLES, getRoleId } = require('../Config/roles');

class UserController {
    constructor() {
        // Query pentru inserarea unui utilizator nou
        this.insertQuery = `
            INSERT INTO users (role_id, email, password, first_name, last_name, phone, birth_date, code_identify, hire_date, department, position, salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Query pentru actualizarea unui utilizator
        this.updateQuery = `
            UPDATE users SET 
                email = ?, first_name = ?, last_name = ?, phone = ?, birth_date = ?, 
                code_identify = ?, hire_date = ?, department = ?, position = ?, salary = ?
            WHERE id = ?
        `;
        
        // Query pentru ștergerea unui utilizator
        this.deleteQuery = 'DELETE FROM users WHERE id = ?';
        
        // Query pentru obținerea tuturor utilizatorilor cu rolurile lor
        this.getAllUsersQuery = `
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.birth_date, 
                   u.code_identify, u.hire_date, u.department, u.position, u.salary,
                   r.name as role, u.created_at, u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY u.created_at DESC
        `;
        
        // Query pentru obținerea utilizatorilor după rol
        this.getUsersByRoleQuery = `
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.birth_date, 
                   u.code_identify, u.hire_date, u.department, u.position, u.salary,
                   r.name as role, u.created_at, u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = ?
            ORDER BY u.created_at DESC
        `;
        
        // Query pentru login
        this.loginQuery = `
            SELECT u.id, u.email, u.password, u.first_name, u.last_name, u.phone, 
                   u.birth_date, u.code_identify, u.hire_date, u.department, u.position, u.salary,
                   r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `;
    }

    // Funcție pentru crearea unui utilizator nou
    async createUser(userData) {
        try {
            const { 
                role, email, password, firstName, lastName, phone, birthDate, 
                codeIdentify, hireDate, department, position, salary 
            } = userData;

            // Validează datele de intrare
            if (!role || !email || !password) {
                return {
                    success: false,
                    error: 'Role, email and password are required'
                };
            }

            // Verifică dacă rolul există și obține ID-ul
            const roleId = await getRoleId(role);
            if (!roleId) {
                return {
                    success: false,
                    error: 'Invalid role specified'
                };
            }

            // Hash-uiește parola
            const hashedPassword = await bcrypt.hash(password, 10);

            await database.connect();
            
            // Verifică dacă email-ul există deja
            const existingUser = await database.query(
                'SELECT id FROM users WHERE email = ?', 
                [email]
            );
            
            if (existingUser.length > 0) {
                return {
                    success: false,
                    error: 'Email already exists'
                };
            }

            // Inserează utilizatorul nou
            const result = await database.query(this.insertQuery, [
                roleId, email, hashedPassword, firstName || null, lastName || null,
                phone || null, birthDate || null, codeIdentify || null,
                hireDate || null, department || null, position || null, salary || null
            ]);

            return {
                success: true,
                message: 'User created successfully',
                userId: result.insertId
            };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                error: 'Failed to create user',
                details: error.message
            };
        }
    }

    // Funcție pentru login
    async loginUser(email, password) {
        try {
            if (!email || !password) {
                return {
                    success: false,
                    error: 'Email and password are required'
                };
            }
            console.log('Attempting login for email:', email);

            await database.connect();
            const result = await database.query(this.loginQuery, [email]);
            
            if (!result || result.length === 0) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            const user = result[0];
            
            // Verifică parola
            console.log('Stored hashed password:', user.password);
            console.log('Attempting to verify password:', password);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid?', isPasswordValid);
            
            if (!isPasswordValid) {
                return {
                    success: false,
                    error: 'Invalid email or password'
                };
            }

            // Get user's role name from database
            let userRole = '';
            try {
                const roleQuery = 'SELECT r.name FROM roles r JOIN users u ON r.id = u.role_id WHERE u.id = ?';
                const roleResult = await database.query(roleQuery, [user.id]);
                userRole = roleResult[0]?.name || '';
            } catch (error) {
                console.error('Error fetching user role:', error);
            }

            // Get user's permissions from database
            let userPermissions = [];
            try {
                const permQuery = `
                    SELECT DISTINCT p.resource, p.action
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    JOIN roles r ON rp.role_id = r.id
                    JOIN users u ON r.id = u.role_id
                    WHERE u.id = ?
                `;
                const permResult = await database.query(permQuery, [user.id]);
                userPermissions = permResult;
            } catch (error) {
                console.error('Error fetching user permissions:', error);
            }

            // Format permissions as resource:ACTION strings
            const formattedPermissions = {};
            userPermissions.forEach(perm => {
                if (!formattedPermissions[perm.resource]) {
                    formattedPermissions[perm.resource] = [];
                }
                formattedPermissions[perm.resource].push(perm.action);
            });
            
            // Create permission strings like "resource:CREATE,READ,UPDATE,DELETE"
            const permissionStrings = Object.entries(formattedPermissions).map(([resource, actions]) => 
                `${resource}:${actions.join(',')}`
            );

            // Creează JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    role: userRole,
                    permissions: permissionStrings
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Returnează datele utilizatorului fără parolă
            const { password: _, ...userWithoutPassword } = user;
            
            return {
                success: true,
                message: 'Login successful',
                token,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Error during login:', error);
            return {
                success: false,
                error: 'Login failed',
                details: error.message
            };
        }
    }

    // Funcție pentru obținerea tuturor utilizatorilor
    async getAllUsers() {
        try {
            await database.connect();
            const users = await database.query(this.getAllUsersQuery);
            
            return {
                success: true,
                users
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: 'Failed to fetch users'
            };
        }
    }

    // Funcție pentru obținerea utilizatorilor după rol
    async getUsersByRole(role) {
        try {
            await database.connect();
            const users = await database.query(this.getUsersByRoleQuery, [role]);
            
            return {
                success: true,
                users
            };
        } catch (error) {
            console.error('Error fetching users by role:', error);
            return {
                success: false,
                error: 'Failed to fetch users'
            };
        }
    }

    // Funcție pentru obținerea unui utilizator după ID
    async getUserById(userId) {
        try {
            await database.connect();
            const result = await database.query(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.birth_date, 
                       u.code_identify, u.hire_date, u.department, u.position, u.salary,
                       r.name as role, u.created_at, u.updated_at
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE u.id = ?
            `, [userId]);
            
            if (result.length === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            return {
                success: true,
                user: result[0]
            };
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            return {
                success: false,
                error: 'Failed to fetch user'
            };
        }
    }

    // Funcție pentru actualizarea unui utilizator
    async updateUser(userId, userData) {
        try {
            const { 
                email, firstName, lastName, phone, birthDate, 
                codeIdentify, hireDate, department, position, salary 
            } = userData;

            await database.connect();
            
            // Verifică dacă utilizatorul există
            const existingUser = await this.getUserById(userId);
            if (!existingUser.success) {
                return existingUser;
            }

            // Verifică dacă noul email este deja folosit de alt utilizator
            if (email && email !== existingUser.user.email) {
                const emailCheck = await database.query(
                    'SELECT id FROM users WHERE email = ? AND id != ?', 
                    [email, userId]
                );
                
                if (emailCheck.length > 0) {
                    return {
                        success: false,
                        error: 'Email already exists'
                    };
                }
            }

            // Actualizează utilizatorul
            const result = await database.query(this.updateQuery, [
                email || existingUser.user.email,
                firstName || existingUser.user.first_name,
                lastName || existingUser.user.last_name,
                phone || existingUser.user.phone,
                birthDate || existingUser.user.birth_date,
                codeIdentify || existingUser.user.code_identify,
                hireDate || existingUser.user.hire_date,
                department || existingUser.user.department,
                position || existingUser.user.position,
                salary || existingUser.user.salary,
                userId
            ]);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'User updated successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'No changes made'
                };
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: 'Failed to update user',
                details: error.message
            };
        }
    }

    // Funcție pentru ștergerea unui utilizator
    async deleteUser(userId) {
        try {
            await database.connect();
            const result = await database.query(this.deleteQuery, [userId]);
            
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'User deleted successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                error: 'Failed to delete user'
            };
        }
    }

    // Funcție pentru schimbarea parolei
    async changePassword(userId, currentPassword, newPassword) {
        try {
            if (!currentPassword || !newPassword) {
                return {
                    success: false,
                    error: 'Current password and new password are required'
                };
            }

            await database.connect();
            
            // Obține parola actuală
            const result = await database.query(
                'SELECT password FROM users WHERE id = ?', 
                [userId]
            );
            
            if (result.length === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // Verifică parola actuală
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, result[0].password);
            if (!isCurrentPasswordValid) {
                return {
                    success: false,
                    error: 'Current password is incorrect'
                };
            }

            // Hash-uiește noua parolă
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            
            // Actualizează parola
            const updateResult = await database.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedNewPassword, userId]
            );

            if (updateResult.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Password changed successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'Failed to change password'
                };
            }
        } catch (error) {
            console.error('Error changing password:', error);
            return {
                success: false,
                error: 'Failed to change password'
            };
        }
    }
}

module.exports = UserController;
