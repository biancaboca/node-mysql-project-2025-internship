const yup = require('yup');

// Login schema
const loginSchema = yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required')
});

// User creation schema
const userCreateSchema = yup.object({
    email: yup.string().email('Invalid email format').required('Email is required').matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 'Email must be a valid format'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phone: yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').required('Phone number is required'),
    birthDate: yup.date().nullable(),
    codeIdentify: yup.string().nullable(),
    department: yup.string().nullable(),
    position: yup.string().nullable(),
    salary: yup.number().positive('Salary must be positive').nullable(),
    role: yup.string().oneOf(['admin', 'employee', 'client'], 'Invalid role')
});

// User update schema (similar to create but all fields optional)
const userUpdateSchema = yup.object({
    email: yup.string().email('Invalid email format'),
    firstName: yup.string(),
    lastName: yup.string(),
    phone: yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    birthDate: yup.date().nullable(),
    codeIdentify: yup.string().nullable(),
    department: yup.string().nullable(),
    position: yup.string().nullable(),
    salary: yup.number().positive('Salary must be positive').nullable(),
    role: yup.string().oneOf(['admin', 'employee', 'client'], 'Invalid role')
});

// Password change schema
const passwordChangeSchema = yup.object({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string().min(6, 'New password must be at least 6 characters').required('New password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Password confirmation is required')
});

// ID parameter schema
const idParamSchema = yup.object({
    id: yup.number().positive().integer().required('ID is required')
});

// Role parameter schema
const roleParamSchema = yup.object({
    role: yup.string().oneOf(['admin', 'employee', 'client'], 'Invalid role').required('Role is required')
});

module.exports = {
    loginSchema,
    userCreateSchema,
    userUpdateSchema,
    passwordChangeSchema,
    idParamSchema,
    roleParamSchema
};