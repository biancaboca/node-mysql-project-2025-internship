const express = require('express');
const UserController = require('../Controller/userController');
const { verifyToken, authorizeRoles, requireResourcePermission } = require('../Middleware/authMiddleware');
const ValidationMiddleware = require('../Middleware/validationMiddleware');
const { 
    loginSchema, 
    userCreateSchema, 
    userUpdateSchema,
    passwordChangeSchema,
    idParamSchema,
    roleParamSchema
} = require('../Validation/userValidation');

class UserRoutes {
    constructor() {
        this.router = express.Router();
        this.userController = new UserController();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Rute publice (fără autentificare)
        this.router.post('/login', ValidationMiddleware.validateBody(loginSchema), this.loginUser.bind(this));
        
        // Rute pentru înregistrare pe bază de rol (din URL)
        this.router.post('/register/admin', ValidationMiddleware.validateBody(userCreateSchema), this.registerAdmin.bind(this));
        this.router.post('/register/employee', ValidationMiddleware.validateBody(userCreateSchema), this.registerEmployee.bind(this));
        this.router.post('/register/client', ValidationMiddleware.validateBody(userCreateSchema), this.registerClient.bind(this));

        this.router.get('/profile', verifyToken, this.getMyProfile.bind(this)); // Profil propriu
        this.router.put('/profile', verifyToken, ValidationMiddleware.validateBody(userUpdateSchema), this.updateMyProfile.bind(this)); // Actualizare profil propriu
        this.router.post('/', verifyToken, requireResourcePermission('clients', 'CREATE'), ValidationMiddleware.validateBody(userCreateSchema), this.createUser.bind(this));
        this.router.get('/', verifyToken, requireResourcePermission('clients', 'READ'), this.getAllUsers.bind(this));
        this.router.get('/role/:role', verifyToken, requireResourcePermission('clients', 'READ'), ValidationMiddleware.validateParams(roleParamSchema), this.getUsersByRole.bind(this));
        this.router.get('/:id', verifyToken, ValidationMiddleware.validateParams(idParamSchema), this.getUserById.bind(this));
        this.router.put('/:id', verifyToken, ValidationMiddleware.validateParams(idParamSchema), ValidationMiddleware.validateBody(userUpdateSchema), this.updateUser.bind(this));
        this.router.delete('/:id', verifyToken, requireResourcePermission('clients', 'DELETE'), ValidationMiddleware.validateParams(idParamSchema), this.deleteUser.bind(this));
        this.router.put('/:id/change-password', verifyToken, ValidationMiddleware.validateParams(idParamSchema), ValidationMiddleware.validateBody(passwordChangeSchema), this.changePassword.bind(this));

        // Rute specifice pentru roluri (rămân pentru compatibilitate)
        this.router.post('/admin', verifyToken, authorizeRoles('admin'), ValidationMiddleware.validateBody(userCreateSchema), this.createAdmin.bind(this));
        this.router.post('/employee', verifyToken, authorizeRoles('admin'), ValidationMiddleware.validateBody(userCreateSchema), this.createEmployee.bind(this));
        this.router.post('/client', ValidationMiddleware.validateBody(userCreateSchema), this.createClient.bind(this)); // Publică pentru înregistrare
        
        // Rute pentru obținerea utilizatorilor după rol
        this.router.get('/admins/all', verifyToken, authorizeRoles('admin'), this.getAllAdmins.bind(this));
        this.router.get('/employees/all', verifyToken, authorizeRoles('admin', 'employee'), this.getAllEmployees.bind(this));
        this.router.get('/clients/all', verifyToken, requireResourcePermission('clients', 'READ'), this.getAllClients.bind(this));
    }

    async loginUser(req, res) {
        try {
            // Add debug information
            console.log('Login attempt - Request body:', req.body);
            console.log('Content-Type:', req.headers['content-type']);
            console.log('Request headers:', req.headers);
            
            // Check if req.body exists
            if (!req.body) {
                console.log('Request body is missing');
                return res.status(400).json({
                    success: false,
                    error: 'Request body is missing'
                });
            }
            
            // Safely extract email and password
            const email = req.body.email;
            const password = req.body.password;
            
            console.log('Email from request:', email);
            console.log('Password from request:', password);
            
            if (!email || !password) {
                console.log('Email or password is missing');
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            const result = await this.userController.loginUser(email, password);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Creare utilizator generic
    async createUser(req, res) {
        try {
            const result = await this.userController.createUser(req.body);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create user error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Creare admin
    async createAdmin(req, res) {
        try {
            const adminData = {
                ...req.body,
                role: 'admin'
            };
            
            const result = await this.userController.createUser(adminData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create admin error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Creare employee
    async createEmployee(req, res) {
        try {
            const employeeData = {
                ...req.body,
                role: 'employee'
            };
            
            const result = await this.userController.createUser(employeeData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create employee error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Creare client (publică pentru înregistrare)
    async createClient(req, res) {
        try {
            const clientData = {
                ...req.body,
                role: 'client'
            };
            
            const result = await this.userController.createUser(clientData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create client error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor utilizatorilor
    async getAllUsers(req, res) {
        try {
            // Clienții nu au acces la lista tuturor utilizatorilor
            if (req.user.role === 'client') {
                return res.status(403).json({
                    success: false,
                    error: 'Clients can only access their own profile. Use /api/users/' + req.user.id
                });
            }

            const result = await this.userController.getAllUsers();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea utilizatorilor după rol
    async getUsersByRole(req, res) {
        try {
            // Clienții nu au acces la lista utilizatorilor după rol
            if (req.user.role === 'client') {
                return res.status(403).json({
                    success: false,
                    error: 'Clients can only access their own profile. Use /api/users/' + req.user.id
                });
            }

            const { role } = req.params;
            const result = await this.userController.getUsersByRole(role);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get users by role error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor adminilor
    async getAllAdmins(req, res) {
        try {
            const result = await this.userController.getUsersByRole('admin');
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    admins: result.users
                });
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all admins error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor employees
    async getAllEmployees(req, res) {
        try {
            const result = await this.userController.getUsersByRole('employee');
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    employees: result.users
                });
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all employees error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor clienților
    async getAllClients(req, res) {
        try {
            const result = await this.userController.getUsersByRole('client');
            
            if (result.success) {
                res.status(200).json({
                    success: true,
                    clients: result.users
                });
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all clients error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea unui utilizator după ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const userId = parseInt(id);
            
            // Verifică dacă utilizatorul încearcă să acceseze propriul profil sau are permisiuni
            if (req.user.id !== userId && req.user.role === 'client') {
                return res.status(403).json({
                    success: false,
                    error: 'You can only access your own profile'
                });
            }
            
            const result = await this.userController.getUserById(userId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Actualizarea unui utilizator
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const userId = parseInt(id);
            
            // Verifică dacă utilizatorul încearcă să-și actualizeze propriul profil sau are permisiuni
            if (req.user.id !== userId && req.user.role === 'client') {
                return res.status(403).json({
                    success: false,
                    error: 'You can only update your own profile'
                });
            }
            
            const result = await this.userController.updateUser(userId, req.body);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Ștergerea unui utilizator
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userId = parseInt(id);
            
            const result = await this.userController.deleteUser(userId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Schimbarea parolei
    async changePassword(req, res) {
        try {
            const { id } = req.params;
            const userId = parseInt(id);
            const { currentPassword, newPassword } = req.body;
            
            // Verifică dacă utilizatorul încearcă să-și schimbe propria parolă sau are permisiuni
            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'You can only change your own password'
                });
            }
            
            const result = await this.userController.changePassword(userId, currentPassword, newPassword);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Înregistrare Admin (din URL)
    async registerAdmin(req, res) {
        try {
            // Adaugă rolul 'admin' la datele din body
            const userData = { ...req.body, role: 'admin' };
            
            const result = await this.userController.createUser(userData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Register admin error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Înregistrare Employee (din URL)
    async registerEmployee(req, res) {
        try {
            // Adaugă rolul 'employee' la datele din body
            const userData = { ...req.body, role: 'employee' };
            
            const result = await this.userController.createUser(userData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Register employee error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Înregistrare Client (din URL)
    async registerClient(req, res) {
        try {
            // Adaugă rolul 'client' la datele din body
            const userData = { ...req.body, role: 'client' };
            
            const result = await this.userController.createUser(userData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Register client error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea profilului propriu (pentru toți utilizatorii)
    async getMyProfile(req, res) {
        try {
            const userId = req.user.id;
            const result = await this.userController.getUserById(userId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get my profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Actualizarea profilului propriu (pentru toți utilizatorii)
    async updateMyProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;
            
            // Previne modificarea rolului prin această rută
            delete updateData.role;
            delete updateData.role_id;
            
            const result = await this.userController.updateUser(userId, updateData);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Update my profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    getRouter() {
        return this.router;
    }
}

module.exports = UserRoutes;
