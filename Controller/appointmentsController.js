const express = require('express');
const database = require('../Database/database');

class AppointmentController {
    constructor() {
        // Query pentru inserarea unei programări noi
        this.insertQuery = `
            INSERT INTO appointments (client_id, employee_id, date, time, price, description, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        // Query pentru actualizarea unei programări
        this.updateQuery = `
            UPDATE appointments SET 
                client_id = ?, employee_id = ?, date = ?, time = ?, 
                price = ?, description = ?, status = ?
            WHERE id = ?
        `;
        
        // Query pentru ștergerea unei programări
        this.deleteQuery = 'DELETE FROM appointments WHERE id = ?';
        
        // Query pentru obținerea tuturor programărilor cu detalii complete
        this.getAllAppointmentsQuery = `
            SELECT a.id, a.date, a.time, a.price, a.description, a.status, a.created_at, a.updated_at,
                   c.id as client_id, c.email as client_email, c.first_name as client_first_name, 
                   c.last_name as client_last_name, c.phone as client_phone,
                   e.id as employee_id, e.email as employee_email, e.first_name as employee_first_name, 
                   e.last_name as employee_last_name, e.department as employee_department, e.position as employee_position
            FROM appointments a
            JOIN users c ON a.client_id = c.id
            JOIN users e ON a.employee_id = e.id
            JOIN roles cr ON c.role_id = cr.id AND cr.name = 'client'
            JOIN roles er ON e.role_id = er.id AND er.name = 'employee'
            ORDER BY a.date DESC, a.time DESC
        `;
        
        // Query pentru obținerea programărilor unui client
        this.getClientAppointmentsQuery = `
            SELECT a.id, a.date, a.time, a.price, a.description, a.status, a.created_at, a.updated_at,
                   e.id as employee_id, e.email as employee_email, e.first_name as employee_first_name, 
                   e.last_name as employee_last_name, e.department as employee_department, e.position as employee_position
            FROM appointments a
            JOIN users e ON a.employee_id = e.id
            JOIN roles er ON e.role_id = er.id AND er.name = 'employee'
            WHERE a.client_id = ?
            ORDER BY a.date DESC, a.time DESC
        `;
        
        // Query pentru obținerea programărilor unui employee
        this.getEmployeeAppointmentsQuery = `
            SELECT a.id, a.date, a.time, a.price, a.description, a.status, a.created_at, a.updated_at,
                   c.id as client_id, c.email as client_email, c.first_name as client_first_name, 
                   c.last_name as client_last_name, c.phone as client_phone
            FROM appointments a
            JOIN users c ON a.client_id = c.id
            JOIN roles cr ON c.role_id = cr.id AND cr.name = 'client'
            WHERE a.employee_id = ?
            ORDER BY a.date DESC, a.time DESC
        `;
    }

    async createAppointment(appointmentData) {
        try {
            const clientId = appointmentData.clientId || appointmentData.client_id;
            const employeeId = appointmentData.employeeId || appointmentData.employee_id;
            const date = appointmentData.date || appointmentData.appointmentDate || appointmentData.appointment_date;
            const time = appointmentData.time || appointmentData.appointmentTime || appointmentData.appointment_time;
            const price = appointmentData.price;
            const description = appointmentData.description || appointmentData.serviceName || appointmentData.service_name;
            const status = appointmentData.status || 'scheduled';
            
            const notes = appointmentData.notes || '';
            const duration = appointmentData.duration || 60; 

            // Validează datele de intrare
            if (!clientId || !employeeId || !date || !time || !description) {
                return {
                    success: false,
                    error: 'Client ID, Employee ID, date, time and description/service are required'
                };
            }

            await database.connect();
            
            const clientCheck = await database.query(`
                SELECT u.id FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = ? AND r.name = 'client'
            `, [clientId]);
            
            if (clientCheck.length === 0) {
                return {
                    success: false,
                    error: 'Invalid client ID'
                };
            }

            const employeeCheck = await database.query(`
                SELECT u.id FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = ? AND r.name = 'employee'
            `, [employeeId]);
            
            if (employeeCheck.length === 0) {
                return {
                    success: false,
                    error: 'Invalid employee ID'
                };
            }

            const conflictCheck = await database.query(`
                SELECT id FROM appointments 
                WHERE employee_id = ? AND date = ? AND time = ? AND status != 'cancelled'
            `, [employeeId, date, time]);
            
            if (conflictCheck.length > 0) {
                return {
                    success: false,
                    error: 'Employee is not available at this time'
                };
            }

            if (!description) {
                description = "General appointment";
            }

            // Inserează programarea
            const result = await database.query(this.insertQuery, [
                clientId, employeeId, date, time, price || 0, description, status || 'scheduled'
            ]);

            return {
                success: true,
                message: 'Appointment created successfully',
                appointmentId: result.insertId
            };
        } catch (error) {
            console.error('Error creating appointment:', error);
            return {
                success: false,
                error: 'Failed to create appointment',
                details: error.message
            };
        }
    }

    async deleteAppointment(appointmentId) {
        try {
            await database.connect();
            const result = await database.query(this.deleteQuery, [appointmentId]);
            
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Appointment deleted successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'Appointment not found'
                };
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
            return {
                success: false,
                error: 'Failed to delete appointment'
            };
        }
    }

    // Funcție pentru obținerea tuturor programărilor
    async getAllAppointments() {
        try {
            await database.connect();
            const appointments = await database.query(this.getAllAppointmentsQuery);
            
            return {
                success: true,
                appointments
            };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return {
                success: false,
                error: 'Failed to fetch appointments'
            };
        }
    }

    // Funcție pentru obținerea programărilor unui client
    async getClientAppointments(clientId) {
        try {
            await database.connect();
            const appointments = await database.query(this.getClientAppointmentsQuery, [clientId]);
            
            return {
                success: true,
                appointments
            };
        } catch (error) {
            console.error('Error fetching client appointments:', error);
            return {
                success: false,
                error: 'Failed to fetch client appointments'
            };
        }
    }

    // Funcție pentru obținerea programărilor unui employee
    async getEmployeeAppointments(employeeId) {
        try {
            await database.connect();
            const appointments = await database.query(this.getEmployeeAppointmentsQuery, [employeeId]);
            
            return {
                success: true,
                appointments
            };
        } catch (error) {
            console.error('Error fetching employee appointments:', error);
            return {
                success: false,
                error: 'Failed to fetch employee appointments'
            };
        }
    }

    // Funcție pentru obținerea unei programări după ID
    async getAppointmentById(appointmentId) {
        try {
            await database.connect();
            const result = await database.query(`
                SELECT a.id, a.date, a.time, a.price, a.description, a.status, a.created_at, a.updated_at,
                       c.id as client_id, c.email as client_email, c.first_name as client_first_name, 
                       c.last_name as client_last_name, c.phone as client_phone,
                       e.id as employee_id, e.email as employee_email, e.first_name as employee_first_name, 
                       e.last_name as employee_last_name, e.department as employee_department, e.position as employee_position
                FROM appointments a
                JOIN users c ON a.client_id = c.id
                JOIN users e ON a.employee_id = e.id
                JOIN roles cr ON c.role_id = cr.id AND cr.name = 'client'
                JOIN roles er ON e.role_id = er.id AND er.name = 'employee'
                WHERE a.id = ?
            `, [appointmentId]);
            
            if (result.length === 0) {
                return {
                    success: false,
                    error: 'Appointment not found'
                };
            }

            return {
                success: true,
                appointment: result[0]
            };
        } catch (error) {
            console.error('Error fetching appointment by ID:', error);
            return {
                success: false,
                error: 'Failed to fetch appointment'
            };
        }
    }

    // Funcție pentru actualizarea unei programări
    async updateAppointment(appointmentId, appointmentData) {
        try {
            const { clientId, employeeId, date, time, price, description, status } = appointmentData;

            await database.connect();
            
            const existingAppointment = await this.getAppointmentById(appointmentId);
            if (!existingAppointment.success) {
                return existingAppointment;
            }

            if (employeeId || date || time) {
                const newEmployeeId = employeeId || existingAppointment.appointment.employee_id;
                const newDate = date || existingAppointment.appointment.date;
                const newTime = time || existingAppointment.appointment.time;
                
                const conflictCheck = await database.query(`
                    SELECT id FROM appointments 
                    WHERE employee_id = ? AND date = ? AND time = ? AND status != 'cancelled' AND id != ?
                `, [newEmployeeId, newDate, newTime, appointmentId]);
                
                if (conflictCheck.length > 0) {
                    return {
                        success: false,
                        error: 'Employee is not available at this time'
                    };
                }
            }

            const result = await database.query(this.updateQuery, [
                clientId || existingAppointment.appointment.client_id,
                employeeId || existingAppointment.appointment.employee_id,
                date || existingAppointment.appointment.date,
                time || existingAppointment.appointment.time,
                price !== undefined ? price : existingAppointment.appointment.price,
                description !== undefined ? description : existingAppointment.appointment.description,
                status || existingAppointment.appointment.status,
                appointmentId
            ]);

            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Appointment updated successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'No changes made'
                };
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            return {
                success: false,
                error: 'Failed to update appointment',
                details: error.message
            };
        }
    }

    async cancelAppointment(appointmentId) {
        try {
            await database.connect();
            const result = await database.query(
                'UPDATE appointments SET status = ? WHERE id = ?',
                ['cancelled', appointmentId]
            );
            
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Appointment cancelled successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'Appointment not found'
                };
            }
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            return {
                success: false,
                error: 'Failed to cancel appointment'
            };
        }
    }

    // Funcție pentru marcarea unei programări ca finalizată
    async completeAppointment(appointmentId) {
        try {
            await database.connect();
            const result = await database.query(
                'UPDATE appointments SET status = ? WHERE id = ?',
                ['completed', appointmentId]
            );
            
            if (result.affectedRows > 0) {
                return {
                    success: true,
                    message: 'Appointment marked as completed'
                };
            } else {
                return {
                    success: false,
                    error: 'Appointment not found'
                };
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            return {
                success: false,
                error: 'Failed to complete appointment'
            };
        }
    }
}

module.exports = AppointmentController;