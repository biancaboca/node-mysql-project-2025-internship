const database = require('../Database/database');

class InventoryController {
    constructor() {
        this.db = database;
    }

    // Adăugarea unui articol nou în inventar
    async addItem(itemData) {
        try {
            // Extract fields from the request, handling both naming conventions
            const name = itemData.name || itemData.material_name;
            const description = itemData.description || itemData.material_description;
            const quantity = itemData.quantity;
            const price = itemData.price || itemData.unit_price; // Accept both price and unit_price
            const unit = itemData.unit;
            const minimum_stock = itemData.minimum_stock || itemData.reorder_level; // Accept both minimum_stock and reorder_level

            // Validare date de intrare
            if (!name || !quantity || (!price && price !== 0)) {
                return {
                    success: false,
                    error: 'Name, quantity and price are required'
                };
            }

            if (quantity < 0 || price < 0) {
                return {
                    success: false,
                    error: 'Quantity and price must be positive numbers'
                };
            }

            const query = `
                INSERT INTO inventory (material_name, material_description, quantity, price, unit, minimum_stock, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            const [result] = await this.db.connection.execute(query, [
                name,
                description || null,
                quantity,
                price,
                unit || 'buc',
                minimum_stock || 10
            ]);

            return {
                success: true,
                message: 'Item added successfully',
                itemId: result.insertId,
                item: {
                    id: result.insertId,
                    name,
                    description,
                    quantity,
                    price,
                    unit: unit || 'buc',
                    minimum_stock: minimum_stock || 10
                }
            };
        } catch (error) {
            console.error('Add item error:', error);
            return {
                success: false,
                error: 'Database error while adding item'
            };
        }
    }

    // Obținerea tuturor articolelor din inventar
    async getAllItems() {
        try {
            const query = `
                SELECT id, material_name as name, material_description as description, quantity, price, unit, minimum_stock, 
                       created_at, updated_at,
                       CASE WHEN quantity <= minimum_stock THEN 1 ELSE 0 END as low_stock
                FROM inventory 
                ORDER BY material_name ASC
            `;

            const [rows] = await this.db.connection.execute(query);

            return {
                success: true,
                items: rows,
                total: rows.length
            };
        } catch (error) {
            console.error('Get all items error:', error);
            return {
                success: false,
                error: 'Database error while fetching items'
            };
        }
    }

    // Obținerea unui articol după ID
    async getItem(itemId) {
        try {
            const query = `
                SELECT id, material_name as name, material_description as description, quantity, price, unit, minimum_stock, 
                       created_at, updated_at,
                       CASE WHEN quantity <= minimum_stock THEN 1 ELSE 0 END as low_stock
                FROM inventory 
                WHERE id = ?
            `;

            const [rows] = await this.db.connection.execute(query, [itemId]);

            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            return {
                success: true,
                item: rows[0]
            };
        } catch (error) {
            console.error('Get item error:', error);
            return {
                success: false,
                error: 'Database error while fetching item'
            };
        }
    }

    // Actualizarea unui articol
    async updateItem(itemId, updateData) {
        try {
            // Verifică dacă articolul există
            const existingItem = await this.getItem(itemId);
            if (!existingItem.success) {
                return existingItem;
            }

            const { name, description, quantity, price, unit, minimum_stock } = updateData;

            // Validare
            if (quantity !== undefined && quantity < 0) {
                return {
                    success: false,
                    error: 'Quantity cannot be negative'
                };
            }

            if (price !== undefined && price < 0) {
                return {
                    success: false,
                    error: 'Price cannot be negative'
                };
            }

            // Construiește query-ul de update dinamic
            const fields = [];
            const values = [];

            if (name !== undefined) {
                fields.push('material_name = ?');
                values.push(name);
            }
            if (description !== undefined) {
                fields.push('material_description = ?');
                values.push(description);
            }
            if (quantity !== undefined) {
                fields.push('quantity = ?');
                values.push(quantity);
            }
            if (price !== undefined) {
                fields.push('price = ?');
                values.push(price);
            }
            if (unit !== undefined) {
                fields.push('unit = ?');
                values.push(unit);
            }
            if (minimum_stock !== undefined) {
                fields.push('minimum_stock = ?');
                values.push(minimum_stock);
            }

            if (fields.length === 0) {
                return {
                    success: false,
                    error: 'No fields to update'
                };
            }

            fields.push('updated_at = NOW()');
            values.push(itemId);

            const query = `UPDATE inventory SET ${fields.join(', ')} WHERE id = ?`;

            await this.db.connection.execute(query, values);

            // Returnează articolul actualizat
            const updatedItem = await this.getItem(itemId);
            return {
                success: true,
                message: 'Item updated successfully',
                item: updatedItem.item
            };
        } catch (error) {
            console.error('Update item error:', error);
            return {
                success: false,
                error: 'Database error while updating item'
            };
        }
    }

    // Ștergerea unui articol
    async deleteItem(itemId) {
        try {
            // Verifică dacă articolul există
            const existingItem = await this.getItem(itemId);
            if (!existingItem.success) {
                return existingItem;
            }

            const query = 'DELETE FROM inventory WHERE id = ?';
            const [result] = await this.db.connection.execute(query, [itemId]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Item not found or could not be deleted'
                };
            }

            return {
                success: true,
                message: 'Item deleted successfully',
                deletedItem: existingItem.item
            };
        } catch (error) {
            console.error('Delete item error:', error);
            return {
                success: false,
                error: 'Database error while deleting item'
            };
        }
    }

    // Obținerea articolelor cu stoc scăzut
    async getLowStockItems(threshold = 10) {
        try {
            const query = `
                SELECT id, material_name as name, material_description as description, quantity, price, unit, minimum_stock, 
                       created_at, updated_at
                FROM inventory 
                WHERE quantity <= ? 
                ORDER BY quantity ASC, material_name ASC
            `;

            const [rows] = await this.db.connection.execute(query, [threshold]);

            return {
                success: true,
                items: rows,
                total: rows.length,
                threshold: threshold
            };
        } catch (error) {
            console.error('Get low stock items error:', error);
            return {
                success: false,
                error: 'Database error while fetching low stock items'
            };
        }
    }

    // Actualizarea stocului pentru un articol
    async updateStock(itemId, newQuantity) {
        try {
            if (newQuantity < 0) {
                return {
                    success: false,
                    error: 'Quantity cannot be negative'
                };
            }

            const query = `
                UPDATE inventory 
                SET quantity = ?, updated_at = NOW() 
                WHERE id = ?
            `;

            const [result] = await this.db.connection.execute(query, [newQuantity, itemId]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Item not found'
                };
            }

            const updatedItem = await this.getItem(itemId);
            return {
                success: true,
                message: 'Stock updated successfully',
                item: updatedItem.item
            };
        } catch (error) {
            console.error('Update stock error:', error);
            return {
                success: false,
                error: 'Database error while updating stock'
            };
        }
    }

    // Scăderea stocului (pentru vânzări)
    async decrementStock(itemId, quantity) {
        try {
            const existingItem = await this.getItem(itemId);
            if (!existingItem.success) {
                return existingItem;
            }

            const currentQuantity = existingItem.item.quantity;
            if (currentQuantity < quantity) {
                return {
                    success: false,
                    error: `Insufficient stock. Available: ${currentQuantity}, Requested: ${quantity}`
                };
            }

            return await this.updateStock(itemId, currentQuantity - quantity);
        } catch (error) {
            console.error('Decrement stock error:', error);
            return {
                success: false,
                error: 'Database error while decrementing stock'
            };
        }
    }

    // Mărirea stocului (pentru reaprovizionare)
    async incrementStock(itemId, quantity) {
        try {
            const existingItem = await this.getItem(itemId);
            if (!existingItem.success) {
                return existingItem;
            }

            const currentQuantity = existingItem.item.quantity;
            return await this.updateStock(itemId, currentQuantity + quantity);
        } catch (error) {
            console.error('Increment stock error:', error);
            return {
                success: false,
                error: 'Database error while incrementing stock'
            };
        }
    }
}

module.exports = InventoryController;
