const express = require('express');
const InventoryController = require('../Controller/inventoryController');
const { verifyToken, requireResourcePermission } = require('../Middleware/authMiddleware');
const ValidationMiddleware = require('../Middleware/validationMiddleware');
const {
    inventoryCreateSchema,
    inventoryUpdateSchema,
    stockAdjustmentSchema,
    idParamSchema
} = require('../Validation/inventoryValidation');

class InventoryRoutes {
    constructor() {
        this.router = express.Router();
        this.inventoryController = new InventoryController();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Rute pentru gestionarea inventarului
        this.router.post('/', verifyToken, requireResourcePermission('inventory', 'CREATE'), ValidationMiddleware.validateBody(inventoryCreateSchema), this.addItem.bind(this));
        this.router.get('/', verifyToken, requireResourcePermission('inventory', 'READ'), this.getAllItems.bind(this));
        this.router.get('/low-stock', verifyToken, requireResourcePermission('inventory', 'READ'), this.getLowStockItems.bind(this));
        this.router.get('/:id', verifyToken, requireResourcePermission('inventory', 'READ'), ValidationMiddleware.validateParams(idParamSchema), this.getItemById.bind(this));
        this.router.put('/:id', verifyToken, requireResourcePermission('inventory', 'UPDATE'), ValidationMiddleware.validateParams(idParamSchema), ValidationMiddleware.validateBody(inventoryUpdateSchema), this.updateItem.bind(this));
        this.router.delete('/:id', verifyToken, requireResourcePermission('inventory', 'DELETE'), ValidationMiddleware.validateParams(idParamSchema), this.deleteItem.bind(this));
    }

    // Adăugarea unui articol nou în inventar
    async addItem(req, res) {
        try {
            const result = await this.inventoryController.addItem(req.body);
            
            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Add item error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea tuturor articolelor din inventar
    async getAllItems(req, res) {
        try {
            const result = await this.inventoryController.getAllItems();
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get all items error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea unui articol după ID
    async getItemById(req, res) {
        try {
            const { id } = req.params;
            const itemId = parseInt(id);
            
            const result = await this.inventoryController.getItem(itemId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Get item by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Actualizarea unui articol din inventar
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const itemId = parseInt(id);
            
            const result = await this.inventoryController.updateItem(itemId, req.body);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Update item error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Ștergerea unui articol din inventar
    async deleteItem(req, res) {
        try {
            const { id } = req.params;
            const itemId = parseInt(id);
            
            const result = await this.inventoryController.deleteItem(itemId);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Delete item error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    // Obținerea articolelor cu stoc scăzut
    async getLowStockItems(req, res) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const result = await this.inventoryController.getLowStockItems(threshold);
            
            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(500).json(result);
            }
        } catch (error) {
            console.error('Get low stock items error:', error);
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

module.exports = InventoryRoutes;
