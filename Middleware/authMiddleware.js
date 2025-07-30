const jwt = require('jsonwebtoken');
const { hasPermission, hasResourcePermission } = require('../Config/roles');

const JWT_SECRET = process.env.JWT_SECRET || 'internship2025'; // In production, always use environment variable

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "No user found" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "You don't have permission to access this resource" 
            });
        }

        next();
    };
};

// Middleware pentru verificarea permisiunilor specifice
const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "No user found" });
        }

        try {
            // First try to check from token permissions
            if (req.user.permissions && Array.isArray(req.user.permissions)) {
                // Parse permissionName (format: resource_action)
                const [resource, action] = permissionName.split('_');
                
                // Check if user has this permission directly in token
                const permissionPattern = new RegExp(`^${resource}:.*${action.toUpperCase()}.*$`, 'i');
                const hasPermissionInToken = req.user.permissions.some(p => permissionPattern.test(p));
                
                if (hasPermissionInToken) {
                    return next();
                }
            }
            
            // Fallback to database check if not in token
            const hasAccess = await hasPermission(req.user.role, permissionName);
            
            if (!hasAccess) {
                return res.status(403).json({ 
                    message: "You don't have the required permission to access this resource" 
                });
            }

            next();
        } catch (error) {
            console.error('Error checking permission:', error);
            return res.status(500).json({ message: "Error verifying permissions" });
        }
    };
};

// Middleware pentru verificarea permisiunilor pe resurse
const requireResourcePermission = (resource, action) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "No user found" });
        }

        try {
            // First check from token permissions
            if (req.user.permissions && Array.isArray(req.user.permissions)) {
                // Check if user has this resource:action permission directly in token
                const actionUpperCase = action.toUpperCase();
                const permissionPattern = new RegExp(`^${resource}:.*${actionUpperCase}.*$`, 'i');
                const hasPermissionInToken = req.user.permissions.some(p => permissionPattern.test(p));
                
                if (hasPermissionInToken) {
                    return next();
                }
            }
            
            // Fallback to database check if not in token
            const hasAccess = await hasResourcePermission(req.user.role, resource, action);
            
            if (!hasAccess) {
                return res.status(403).json({ 
                    message: `You don't have ${action} permission for ${resource}` 
                });
            }

            next();
        } catch (error) {
            console.error('Error checking resource permission:', error);
            return res.status(500).json({ message: "Error verifying permissions" });
        }
    };
};

// Helper function to get user permissions from token
const getUserPermissions = (req) => {
    if (!req.user || !req.user.permissions) return [];
    
    // Return formatted object with resources and actions
    const permissions = {};
    
    if (Array.isArray(req.user.permissions)) {
        req.user.permissions.forEach(permString => {
            const [resource, actionsStr] = permString.split(':');
            if (resource && actionsStr) {
                const actions = actionsStr.split(',');
                permissions[resource] = actions;
            }
        });
    }
    
    return permissions;
};

module.exports = {
    verifyToken,
    authorizeRoles,
    requirePermission,
    requireResourcePermission,
    getUserPermissions,
    JWT_SECRET
};
