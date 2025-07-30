const yup = require('yup');

// Invoice creation schema
const invoiceCreateSchema = yup.object({
    client_id: yup.number().positive().integer().required('Client ID is required'),
    amount: yup.number().positive('Amount must be positive').required('Invoice amount is required'),
    date: yup.date().required('Invoice date is required'),
    deadline: yup.date().min(
        yup.ref('date'),
        'Deadline cannot be before the invoice date'
    ),
    status: yup.string()
        .oneOf(['pending', 'paid', 'overdue', 'cancelled'], 'Invalid status')
        .default('pending'),
    items: yup.mixed().required('Invoice items are required')
});

// Invoice update schema (similar to create but all fields optional)
const invoiceUpdateSchema = yup.object({
    client_id: yup.number().positive().integer(),
    amount: yup.number().positive('Amount must be positive'),
    date: yup.date(),
    deadline: yup.date(),
    status: yup.string().oneOf(['pending', 'paid', 'overdue', 'cancelled'], 'Invalid status'),
    items: yup.mixed()
});

// Status update schema
const invoiceStatusSchema = yup.object({
    status: yup.string()
        .oneOf(['pending', 'paid', 'overdue', 'cancelled'], 'Invalid status')
        .required('Status is required')
});

// ID parameter schema
const idParamSchema = yup.object({
    id: yup.number().positive().integer().required('Invoice ID is required')
});

// Client ID parameter schema
const clientIdParamSchema = yup.object({
    clientId: yup.number().positive().integer().required('Client ID is required')
});

module.exports = {
    invoiceCreateSchema,
    invoiceUpdateSchema,
    invoiceStatusSchema,
    idParamSchema,
    clientIdParamSchema
};
