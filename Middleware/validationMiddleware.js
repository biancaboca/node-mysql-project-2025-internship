const yup = require('yup');

class ValidationMiddleware {
    /**
     * Validate request body against a schema
     * @param {yup.ObjectSchema} schema - Yup validation schema
     * @param {boolean} abortEarly - Whether to abort validation after first error (default: false)
     * @returns {Function} Express middleware function
     */
    static validateBody(schema, abortEarly = false) {
        return async (req, res, next) => {
            try {
                // If no schema is provided, skip validation
                if (!schema) {
                    return next();
                }

                // Validate the request body against the schema
                const validatedData = await schema.validate(req.body, { 
                    abortEarly,
                    stripUnknown: false // Keep unknown fields
                });
                
                // Replace req.body with validated data
                req.body = validatedData;
                next();
            } catch (error) {
                if (error.name === 'ValidationError') {
                    return res.status(400).json({
                        success: false,
                        error: 'Validation error',
                        details: error.errors || [error.message]
                    });
                }
                
                next(error);
            }
        };
    }

    /**
     * Validate request query parameters against a schema
     * @param {yup.ObjectSchema} schema - Yup validation schema
     * @returns {Function} Express middleware function
     */
    static validateQuery(schema) {
        return async (req, res, next) => {
            try {
                // If no schema is provided, skip validation
                if (!schema) {
                    return next();
                }

                // Validate the request query against the schema
                const validatedQuery = await schema.validate(req.query, {
                    abortEarly: false,
                    stripUnknown: false
                });
                
                // Replace req.query with validated data
                req.query = validatedQuery;
                next();
            } catch (error) {
                if (error.name === 'ValidationError') {
                    return res.status(400).json({
                        success: false,
                        error: 'Query parameter validation error',
                        details: error.errors || [error.message]
                    });
                }
                
                next(error);
            }
        };
    }

    /**
     * Validate request parameters against a schema
     * @param {yup.ObjectSchema} schema - Yup validation schema
     * @returns {Function} Express middleware function
     */
    static validateParams(schema) {
        return async (req, res, next) => {
            try {
                // If no schema is provided, skip validation
                if (!schema) {
                    return next();
                }

                // Validate the request parameters against the schema
                const validatedParams = await schema.validate(req.params, {
                    abortEarly: false,
                    stripUnknown: false
                });
                
                // Replace req.params with validated data
                req.params = validatedParams;
                next();
            } catch (error) {
                if (error.name === 'ValidationError') {
                    return res.status(400).json({
                        success: false,
                        error: 'Path parameter validation error',
                        details: error.errors || [error.message]
                    });
                }
                
                next(error);
            }
        };
    }

    /**
     * Create custom validation middleware
     * @param {Function} validationFn - Custom validation function
     * @returns {Function} Express middleware function
     */
    static custom(validationFn) {
        return async (req, res, next) => {
            try {
                await validationFn(req);
                next();
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: [error.message]
                });
            }
        };
    }
}

module.exports = ValidationMiddleware;
