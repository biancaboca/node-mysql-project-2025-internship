const express = require('express');
const AppointmentController = require('../Controller/appointmentsController');
const { verifyToken, authorizeRoles, requireResourcePermission } = require('../Middleware/authMiddleware');
const ValidationMiddleware = require('../Middleware/validationMiddleware');
const {
    appointmentCreateSchema,
    appointmentUpdateSchema,
    appointmentStatusSchema,
    idParamSchema,
    clientIdParamSchema,
    employeeIdParamSchema
} = require('../Validation/appointmentValidation');

class AppointmentRoutes {
    constructor() {
        this.router = express.Router();
        this.appointmentController = new AppointmentController();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Rute pentru gestionarea programărilor
        this.router.post('/', verifyToken, requireResourcePermission('appointments', 'CREATE'), ValidationMiddleware.validateBody(appointmentCreateSchema), this.createAppointment.bind(this));
        this.router.get('/', verifyToken, requireResourcePermission('appointments', 'READ'), this.getAllAppointments.bind(this));
        this.router.get('/client/:clientId', verifyToken, ValidationMiddleware.validateParams(clientIdParamSchema), this.getClientAppointments.bind(this));
        this.router.get('/employee/:employeeId', verifyToken, ValidationMiddleware.validateParams(employeeIdParamSchema), this.getEmployeeAppointments.bind(this));
        this.router.get('/:id', verifyToken, requireResourcePermission('appointments', 'READ'), ValidationMiddleware.validateParams(idParamSchema), this.getAppointmentById.bind(this));
        this.router.put('/:id', verifyToken, requireResourcePermission('appointments', 'UPDATE'), ValidationMiddleware.validateParams(idParamSchema), ValidationMiddleware.validateBody(appointmentUpdateSchema), this.updateAppointment.bind(this));
        this.router.delete('/:id', verifyToken, requireResourcePermission('appointments', 'DELETE'), ValidationMiddleware.validateParams(idParamSchema), this.deleteAppointment.bind(this));
        this.router.put('/:id/cancel', verifyToken, ValidationMiddleware.validateParams(idParamSchema), this.cancelAppointment.bind(this));
        this.router.put('/:id/complete', verifyToken, authorizeRoles('admin', 'employee'), ValidationMiddleware.validateParams(idParamSchema), this.completeAppointment.bind(this));
    }

    // Crearea unei programări noi
    async createAppointment(req, res) {
        try {
            const appointmentData = req.body;
            
            // Dacă utilizatorul este client, setează automat client_id la ID-ul său
            if (req.user.role === 'client') {
                appointmentData.clientId = req.user.id;
            }
            
            const result = await this.appointmentController.createAppointment(appointmentData);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create appointment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor programărilor
    async getAllAppointments(req, res) {
        try {
            const result = await this.appointmentController.getAllAppointments();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all appointments error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea programărilor unui client
    async getClientAppointments(req, res) {
        try {
            const { clientId } = req.params;
            const requestedClientId = parseInt(clientId);
            
            // Verifică dacă utilizatorul încearcă să acceseze propriile programări sau are permisiuni
            if (req.user.role === 'client' && req.user.id !== requestedClientId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only access your own appointments'
                });
            }
            
            const result = await this.appointmentController.getClientAppointments(requestedClientId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get client appointments error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea programărilor unui employee
    async getEmployeeAppointments(req, res) {
        try {
            const { employeeId } = req.params;
            const requestedEmployeeId = parseInt(employeeId);
            
            // Verifică dacă utilizatorul încearcă să acceseze propriile programări sau are permisiuni
            if (req.user.role === 'employee' && req.user.id !== requestedEmployeeId) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only access your own appointments'
                });
            }
            
            const result = await this.appointmentController.getEmployeeAppointments(requestedEmployeeId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get employee appointments error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea unei programări după ID
    async getAppointmentById(req, res) {
        try {
            const { id } = req.params;
            const appointmentId = parseInt(id);
            
            const result = await this.appointmentController.getAppointmentById(appointmentId);
            
            if (result.success) {
                // Verifică dacă utilizatorul are dreptul să vadă această programare
                if (req.user.role === 'client' && req.user.id !== result.appointment.client_id) {
                    return res.status(403).json({
                        success: false,
                        error: 'You can only access your own appointments'
                    });
                }
                
                if (req.user.role === 'employee' && req.user.id !== result.appointment.employee_id) {
                    return res.status(403).json({
                        success: false,
                        error: 'You can only access your own appointments'
                    });
                }
                
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get appointment by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Actualizarea unei programări
    async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointmentId = parseInt(id);
            const appointmentData = req.body;
            
            // Verifică dacă programarea există și utilizatorul are dreptul să o modifice
            const existingAppointment = await this.appointmentController.getAppointmentById(appointmentId);
            if (!existingAppointment.success) {
                return res.status(404).json(existingAppointment);
            }
            
            if (req.user.role === 'client' && req.user.id !== existingAppointment.appointment.client_id) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only modify your own appointments'
                });
            }
            
            if (req.user.role === 'employee' && req.user.id !== existingAppointment.appointment.employee_id) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only modify your own appointments'
                });
            }
            
            const result = await this.appointmentController.updateAppointment(appointmentId, appointmentData);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Update appointment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Ștergerea unei programări
    async deleteAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointmentId = parseInt(id);
            
            const result = await this.appointmentController.deleteAppointment(appointmentId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete appointment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Anularea unei programări
    async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointmentId = parseInt(id);
            
            // Verifică dacă programarea există și utilizatorul are dreptul să o anuleze
            const existingAppointment = await this.appointmentController.getAppointmentById(appointmentId);
            if (!existingAppointment.success) {
                return res.status(404).json(existingAppointment);
            }
            
            if (req.user.role === 'client' && req.user.id !== existingAppointment.appointment.client_id) {
                return res.status(403).json({
                    success: false,
                    error: 'You can only cancel your own appointments'
                });
            }
            
            const result = await this.appointmentController.cancelAppointment(appointmentId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Cancel appointment error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Marcarea unei programări ca finalizată
    async completeAppointment(req, res) {
        try {
            const { id } = req.params;
            const appointmentId = parseInt(id);
            
            const result = await this.appointmentController.completeAppointment(appointmentId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Complete appointment error:', error);
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

module.exports = AppointmentRoutes;
