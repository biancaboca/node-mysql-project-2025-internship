const yup = require('yup');

// Inventory item creation schema
const inventoryCreateSchema = yup.object({
    name: yup.string().required('Material name is required'),
    material_description: yup.string(),
    quantity: yup.number().integer('Quantity must be an integer').min(0, 'Quantity cannot be negative').required('Quantity is required'),
    minimum_stock: yup.number().integer('Minimum stock must be an integer').min(0, 'Minimum stock cannot be negative').default(10).required('Minimum stock is required')   ,
    price: yup.number().positive('Price must be positive').required('Price is required'),
    unit: yup.string().default('buc')
});

// Inventory item update schema (similar to create but all fields optional)
const inventoryUpdateSchema = yup.object({
    material_name: yup.string(),
    material_description: yup.string(),
    quantity: yup.number().integer('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
    minimum_stock: yup.number().integer('Minimum stock must be an integer').min(0, 'Minimum stock cannot be negative'),
    price: yup.number().positive('Price must be positive'),
    unit: yup.string()
});

// Stock adjustment schema
const stockAdjustmentSchema = yup.object({
    quantity: yup.number().integer('Quantity must be an integer').required('Quantity adjustment is required'),
    reason: yup.string().required('Adjustment reason is required')
});

// ID parameter schema
const idParamSchema = yup.object({
    id: yup.number().positive().integer().required('Inventory item ID is required')
});

module.exports = {
    inventoryCreateSchema,
    inventoryUpdateSchema,
    stockAdjustmentSchema,
    idParamSchema
};
