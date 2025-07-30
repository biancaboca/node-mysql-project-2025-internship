const yup = require('yup');

// Appointment creation schema
const appointmentCreateSchema = yup.object({
    // Support both camelCase and snake_case
    clientId: yup.number().positive().integer(),
    client_id: yup.number().positive().integer(),
    
    employeeId: yup.number().positive().integer(),
    employee_id: yup.number().positive().integer(),
    
    // Support both field naming conventions
    description: yup.string(),
    serviceName: yup.string(),
    service_name: yup.string(),
    
    // Date can be in multiple formats
    date: yup.date(),
    appointmentDate: yup.date(),
    appointment_date: yup.date(),
    
    // Time can be in multiple formats
    time: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format (HH:MM:SS)'),
    appointmentTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format (HH:MM:SS)'),
    appointment_time: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format (HH:MM:SS)'),
    
    duration: yup.number().positive().integer().default(60),
    status: yup.string()
        .oneOf(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], 'Invalid status')
        .default('scheduled'),
    price: yup.number().positive('Price must be positive'),
    notes: yup.string()
})
.test(
    'required-client-id', 
    'Client ID is required', 
    function(value) {
        return value.clientId || value.client_id;
    }
)
.test(
    'required-service-info', 
    'Service name is required', 
    function(value) {
        return value.description || value.serviceName || value.service_name;
    }
)
.test(
    'required-date', 
    'Appointment date is required', 
    function(value) {
        return value.date || value.appointmentDate || value.appointment_date;
    }
)
.test(
    'required-time', 
    'Appointment time is required', 
    function(value) {
        return value.time || value.appointmentTime || value.appointment_time;
    }
);

// Appointment update schema (similar to create but all fields optional)
const appointmentUpdateSchema = yup.object({
    clientId: yup.number().positive().integer(),
    employeeId: yup.number().positive().integer(),
    serviceName: yup.string(),
    appointmentDate: yup.date(),
    appointmentTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format (HH:MM:SS)'),
    duration: yup.number().positive().integer(),
    status: yup.string().oneOf(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], 'Invalid status'),
    price: yup.number().positive('Price must be positive'),
    notes: yup.string()
});

// Status update schema
const appointmentStatusSchema = yup.object({
    status: yup.string()
        .oneOf(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], 'Invalid status')
        .required('Status is required')
});

// ID parameter schema
const idParamSchema = yup.object({
    id: yup.number().positive().integer().required('Appointment ID is required')
});

// Client ID parameter schema
const clientIdParamSchema = yup.object({
    clientId: yup.number().positive().integer().required('Client ID is required')
});

// Employee ID parameter schema
const employeeIdParamSchema = yup.object({
    employeeId: yup.number().positive().integer().required('Employee ID is required')
});

module.exports = {
    appointmentCreateSchema,
    appointmentUpdateSchema,
    appointmentStatusSchema,
    idParamSchema,
    clientIdParamSchema,
    employeeIdParamSchema
};
