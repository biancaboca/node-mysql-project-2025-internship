const express = require('express');
const InvoiceController = require('../Controller/invoicesController');
const { verifyToken, requireResourcePermission } = require('../Middleware/authMiddleware');
const ValidationMiddleware = require('../Middleware/validationMiddleware');
const {
    invoiceCreateSchema,
    invoiceUpdateSchema,
    invoiceStatusSchema,
    idParamSchema,
    clientIdParamSchema
} = require('../Validation/invoiceValidation');

// Debug what's being imported
console.log('InvoiceController type:', typeof InvoiceController);
console.log('InvoiceController content:', InvoiceController);

class InvoicesRoutes {
    constructor() {
        this.router = express.Router();
        
        if (typeof InvoiceController === 'function') {
            this.invoicesController = new InvoiceController();
        } else {
            this.invoicesController = InvoiceController;
        }
        
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Rute pentru gestionarea facturilor
        this.router.post('/', verifyToken, requireResourcePermission('invoices', 'CREATE'), ValidationMiddleware.validateBody(invoiceCreateSchema), this.createInvoice.bind(this));
        this.router.get('/', verifyToken, requireResourcePermission('invoices', 'READ'), this.getAllInvoices.bind(this));
        this.router.get('/client/:clientId', verifyToken, requireResourcePermission('invoices', 'READ'), ValidationMiddleware.validateParams(clientIdParamSchema), this.getInvoicesByClient.bind(this));
        this.router.get('/pending', verifyToken, requireResourcePermission('invoices', 'READ'), this.getPendingInvoices.bind(this));
        this.router.get('/paid', verifyToken, requireResourcePermission('invoices', 'READ'), this.getPaidInvoices.bind(this));
        this.router.get('/:id', verifyToken, requireResourcePermission('invoices', 'READ'), ValidationMiddleware.validateParams(idParamSchema), this.getInvoiceById.bind(this));
        this.router.put('/:id', verifyToken, requireResourcePermission('invoices', 'UPDATE'), ValidationMiddleware.validateParams(idParamSchema), ValidationMiddleware.validateBody(invoiceUpdateSchema), this.updateInvoice.bind(this));
        this.router.put('/:id/pay', verifyToken, requireResourcePermission('invoices', 'UPDATE'), ValidationMiddleware.validateParams(idParamSchema), this.markAsPaid.bind(this));
        this.router.delete('/:id', verifyToken, requireResourcePermission('invoices', 'DELETE'), ValidationMiddleware.validateParams(idParamSchema), this.deleteInvoice.bind(this));
    }

    // Crearea unei facturi noi
    async createInvoice(req, res) {
        try {
            const result = await this.invoicesController.createInvoice(req.body);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Create invoice error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor facturilor
    async getAllInvoices(req, res) {
        try {
            // Dacă utilizatorul este client, returnează doar facturile sale
            if (req.user.role_name === 'client') {
                const result = await this.invoicesController.getInvoicesByClient(req.user.id);
                return res.status(200).json(result);
            }
            
            // Pentru admin și employee, returnează toate facturile
            const result = await this.invoicesController.getAllInvoices();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all invoices error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea facturilor pentru un client specific
    async getInvoicesByClient(req, res) {
        try {
            const { clientId } = req.params;
            const targetClientId = parseInt(clientId);
            
            // Clienții pot vedea doar propriile facturi
            if (req.user.role_name === 'client' && req.user.id !== targetClientId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only view your own invoices'
                });
            }
            
            const result = await this.invoicesController.getInvoicesByClient(targetClientId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get invoices by client error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea unei facturi după ID
    async getInvoiceById(req, res) {
        try {
            const { id } = req.params;
            const invoiceId = parseInt(id);
            
            const result = await this.invoicesController.getInvoice(invoiceId);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            // Clienții pot vedea doar propriile facturi
            if (req.user.role_name === 'client' && result.invoice.client_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only view your own invoices'
                });
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Get invoice by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea facturilor în așteptare
    async getPendingInvoices(req, res) {
        try {
            // Dacă utilizatorul este client, returnează doar facturile sale în așteptare
            if (req.user.role_name === 'client') {
                const result = await this.invoicesController.getInvoicesByClientAndStatus(req.user.id, 'pending');
                return res.status(200).json(result);
            }
            
            // Pentru admin și employee, returnează toate facturile în așteptare
            const result = await this.invoicesController.getInvoicesByStatus('pending');
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get pending invoices error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea facturilor plătite
    async getPaidInvoices(req, res) {
        try {
            // Dacă utilizatorul este client, returnează doar facturile sale plătite
            if (req.user.role_name === 'client') {
                const result = await this.invoicesController.getInvoicesByClientAndStatus(req.user.id, 'paid');
                return res.status(200).json(result);
            }
            
            // Pentru admin și employee, returnează toate facturile plătite
            const result = await this.invoicesController.getInvoicesByStatus('paid');
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get paid invoices error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Actualizarea unei facturi
    async updateInvoice(req, res) {
        try {
            const { id } = req.params;
            const invoiceId = parseInt(id);
            
            // Verifică dacă factura există și dacă clientul încearcă să-și modifice propria factură
            if (req.user.role_name === 'client') {
                const existingInvoice = await this.invoicesController.getInvoice(invoiceId);
                if (!existingInvoice.success) {
                    return res.status(404).json(existingInvoice);
                }
                
                if (existingInvoice.invoice.client_id !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied: You can only modify your own invoices'
                    });
                }
            }
            
            const result = await this.invoicesController.updateInvoice(invoiceId, req.body);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Update invoice error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Marcarea unei facturi ca plătită
    async markAsPaid(req, res) {
        try {
            const { id } = req.params;
            const invoiceId = parseInt(id);
            
            const result = await this.invoicesController.markAsPaid(invoiceId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Mark as paid error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Ștergerea unei facturi
    async deleteInvoice(req, res) {
        try {
            const { id } = req.params;
            const invoiceId = parseInt(id);
            
            const result = await this.invoicesController.deleteInvoice(invoiceId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete invoice error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    getRouter() {
        return this.router;
    }

    getRouter() {
        return this.router;
    }
}

module.exports = InvoicesRoutes;
