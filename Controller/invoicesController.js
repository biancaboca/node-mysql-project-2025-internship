const database = require('../Database/database');

class InvoiceController {
    constructor() {
        // Don't store database as property, use the imported module directly
    }

    async createInvoice(invoiceData) {
        try {
            const { client_id, amount, date, deadline, status = 'pending', items } = invoiceData;

            if (!client_id || !amount || !date) {
                return {
                    success: false,
                    error: 'Client ID, amount and date are required'
                };
            }

            if (amount <= 0) {
                return {
                    success: false,
                    error: 'Amount must be positive'
                };
            }

            const itemsJson = Array.isArray(items) ? JSON.stringify(items) : items;

            await database.connect();
            
            const query = `
                INSERT INTO invoices (client_id, amount, date, deadline, status, items, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            const result = await database.query(query, [
                client_id,
                amount,
                date,
                deadline || null,
                status,
                itemsJson || null
            ]);

            return {
                success: true,
                message: 'Invoice created successfully',
                invoiceId: result.insertId,
                invoice: {
                    id: result.insertId,
                    client_id,
                    amount,
                    date,
                    deadline,
                    status,
                    items: items || null
                }
            };
        } catch (error) {
            console.error('Create invoice error:', error);
            return {
                success: false,
                error: 'Database error while creating invoice'
            };
        }
    }

    async getAllInvoices() {
        try {
            await database.connect();
            
            const query = `
                SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
                FROM invoices i
                LEFT JOIN users u ON i.client_id = u.id
                ORDER BY i.created_at DESC
            `;

            const rows = await database.query(query);

            const invoices = rows.map(invoice => {
                let parsedItems = null;
                
                if (invoice.items) {
                    // Check if items is already an object
                    if (typeof invoice.items === 'object' && invoice.items !== null) {
                        parsedItems = invoice.items;
                    } else {
                        // Try to parse it as JSON
                        try {
                            parsedItems = JSON.parse(invoice.items);
                        } catch (err) {
                            console.log(`Failed to parse items for invoice ${invoice.id}:`, err.message);
                            console.log('Raw items value:', invoice.items);
                            // If parsing fails, return the raw value
                            parsedItems = invoice.items;
                        }
                    }
                }
                
                return {
                    ...invoice,
                    items: parsedItems
                };
            });

            return {
                success: true,
                invoices: invoices,
                total: invoices.length
            };
        } catch (error) {
            console.error('Get all invoices error:', error);
            return {
                success: false,
                error: 'Database error while fetching invoices'
            };
        }
    }

    async getInvoice(invoiceId) {
        try {
            await database.connect();
            
            const query = `
                SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
                FROM invoices i
                LEFT JOIN users u ON i.client_id = u.id
                WHERE i.id = ?
            `;

            const rows = await database.query(query, [invoiceId]);

            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Invoice not found'
                };
            }

            let parsedItems = null;
            if (rows[0].items) {
                // Check if items is already an object
                if (typeof rows[0].items === 'object' && rows[0].items !== null) {
                    parsedItems = rows[0].items;
                } else {
                    // Try to parse it as JSON
                    try {
                        parsedItems = JSON.parse(rows[0].items);
                    } catch (err) {
                        console.log(`Failed to parse items for invoice ${rows[0].id}:`, err.message);
                        console.log('Raw items value:', rows[0].items);
                        // If parsing fails, return the raw value
                        parsedItems = rows[0].items;
                    }
                }
            }
            
            const invoice = {
                ...rows[0],
                items: parsedItems
            };

            return {
                success: true,
                invoice: invoice
            };
        } catch (error) {
            console.error('Get invoice error:', error);
            return {
                success: false,
                error: 'Database error while fetching invoice'
            };
        }
    }

    async getInvoicesByClient(clientId) {
        try {
            await database.connect();
            
            const query = `
                SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
                FROM invoices i
                LEFT JOIN users u ON i.client_id = u.id
                WHERE i.client_id = ?
                ORDER BY i.created_at DESC
            `;

            const rows = await database.query(query, [clientId]);

            const invoices = rows.map(invoice => {
                let parsedItems = null;
                
                if (invoice.items) {
                    // Check if items is already an object
                    if (typeof invoice.items === 'object' && invoice.items !== null) {
                        parsedItems = invoice.items;
                    } else {
                        // Try to parse it as JSON
                        try {
                            parsedItems = JSON.parse(invoice.items);
                        } catch (err) {
                            console.log(`Failed to parse items for invoice ${invoice.id}:`, err.message);
                            console.log('Raw items value:', invoice.items);
                            // If parsing fails, return the raw value
                            parsedItems = invoice.items;
                        }
                    }
                }
                
                return {
                    ...invoice,
                    items: parsedItems
                };
            });

            return {
                success: true,
                invoices: invoices,
                total: invoices.length
            };
        } catch (error) {
            console.error('Get invoices by client error:', error);
            return {
                success: false,
                error: 'Database error while fetching client invoices'
            };
        }
    }

    async getInvoicesByStatus(status) {
        try {
            await database.connect();
            
            const query = `
                SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
                FROM invoices i
                LEFT JOIN users u ON i.client_id = u.id
                WHERE i.status = ?
                ORDER BY i.created_at DESC
            `;

            const rows = await database.query(query, [status]);

            const invoices = rows.map(invoice => {
                let parsedItems = null;
                
                if (invoice.items) {
                    // Check if items is already an object
                    if (typeof invoice.items === 'object' && invoice.items !== null) {
                        parsedItems = invoice.items;
                    } else {
                        // Try to parse it as JSON
                        try {
                            parsedItems = JSON.parse(invoice.items);
                        } catch (err) {
                            console.log(`Failed to parse items for invoice ${invoice.id}:`, err.message);
                            console.log('Raw items value:', invoice.items);
                            // If parsing fails, return the raw value
                            parsedItems = invoice.items;
                        }
                    }
                }
                
                return {
                    ...invoice,
                    items: parsedItems
                };
            });

            return {
                success: true,
                invoices: invoices,
                total: invoices.length,
                status: status
            };
        } catch (error) {
            console.error('Get invoices by status error:', error);
            return {
                success: false,
                error: 'Database error while fetching invoices by status'
            };
        }
    }

    async getInvoicesByClientAndStatus(clientId, status) {
        try {
            await database.connect();
            
            const query = `
                SELECT i.*, CONCAT(u.first_name, ' ', u.last_name) as client_name, u.email as client_email
                FROM invoices i
                LEFT JOIN users u ON i.client_id = u.id
                WHERE i.client_id = ? AND i.status = ?
                ORDER BY i.created_at DESC
            `;

            const rows = await database.query(query, [clientId, status]);

            const invoices = rows.map(invoice => {
                let parsedItems = null;
                
                if (invoice.items) {
                    // Check if items is already an object
                    if (typeof invoice.items === 'object' && invoice.items !== null) {
                        parsedItems = invoice.items;
                    } else {
                        // Try to parse it as JSON
                        try {
                            parsedItems = JSON.parse(invoice.items);
                        } catch (err) {
                            console.log(`Failed to parse items for invoice ${invoice.id}:`, err.message);
                            console.log('Raw items value:', invoice.items);
                            // If parsing fails, return the raw value
                            parsedItems = invoice.items;
                        }
                    }
                }
                
                return {
                    ...invoice,
                    items: parsedItems
                };
            });

            return {
                success: true,
                invoices: invoices,
                total: invoices.length,
                clientId: clientId,
                status: status
            };
        } catch (error) {
            console.error('Get invoices by client and status error:', error);
            return {
                success: false,
                error: 'Database error while fetching invoices'
            };
        }
    }

    async updateInvoice(invoiceId, updateData) {
        try {
            const existingInvoice = await this.getInvoice(invoiceId);
            if (!existingInvoice.success) {
                return existingInvoice;
            }

            const { client_id, amount, date, deadline, status, items } = updateData;

            if (amount !== undefined && amount <= 0) {
                return {
                    success: false,
                    error: 'Amount must be positive'
                };
            }

            const fields = [];
            const values = [];

            if (client_id !== undefined) {
                fields.push('client_id = ?');
                values.push(client_id);
            }
            if (amount !== undefined) {
                fields.push('amount = ?');
                values.push(amount);
            }
            if (date !== undefined) {
                fields.push('date = ?');
                values.push(date);
            }
            if (deadline !== undefined) {
                fields.push('deadline = ?');
                values.push(deadline);
            }
            if (status !== undefined) {
                fields.push('status = ?');
                values.push(status);
            }
            if (items !== undefined) {
                fields.push('items = ?');
                values.push(Array.isArray(items) ? JSON.stringify(items) : items);
            }

            if (fields.length === 0) {
                return {
                    success: false,
                    error: 'No fields to update'
                };
            }

            fields.push('updated_at = NOW()');
            values.push(invoiceId);

            const query = `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`;

            await database.connect();
            await database.query(query, values);

            const updatedInvoice = await this.getInvoice(invoiceId);
            return {
                success: true,
                message: 'Invoice updated successfully',
                invoice: updatedInvoice.invoice
            };
        } catch (error) {
            console.error('Update invoice error:', error);
            return {
                success: false,
                error: 'Database error while updating invoice'
            };
        }
    }

    async markAsPaid(invoiceId) {
        try {
            await database.connect();
            
            const query = `
                UPDATE invoices 
                SET status = 'paid', updated_at = NOW() 
                WHERE invoice_id = ?
            `;

            const result = await database.query(query, [invoiceId]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Invoice not found'
                };
            }

            const updatedInvoice = await this.getInvoice(invoiceId);
            return {
                success: true,
                message: 'Invoice marked as paid successfully',
                invoice: updatedInvoice.invoice
            };
        } catch (error) {
            console.error('Mark as paid error:', error);
            return {
                success: false,
                error: 'Database error while marking invoice as paid'
            };
        }
    }

    async deleteInvoice(invoiceId) {
        try {
            const existingInvoice = await this.getInvoice(invoiceId);
            if (!existingInvoice.success) {
                return existingInvoice;
            }

            await database.connect();
            const query = 'DELETE FROM invoices WHERE id = ?';
            const result = await database.query(query, [invoiceId]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Invoice not found or could not be deleted'
                };
            }

            return {
                success: true,
                message: 'Invoice deleted successfully',
                deletedInvoice: existingInvoice.invoice
            };
        } catch (error) {
            console.error('Delete invoice error:', error);
            return {
                success: false,
                error: 'Database error while deleting invoice'
            };
        }
    }
}

module.exports = InvoiceController;
