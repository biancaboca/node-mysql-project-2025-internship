const database = require('../Database/database');

// Define role constants
const ROLES = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CLIENT: 'client'
};

// Cache pentru permisiuni
let permissionsCache = {};
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minute

// Funcție pentru a obține permisiunile unui rol din baza de date
const getRolePermissions = async (roleName) => {
    try {
        const now = Date.now();
        const cacheKey = roleName;
        
        // Verifică cache-ul
        if (permissionsCache[cacheKey] && now < cacheExpiry) {
            return permissionsCache[cacheKey];
        }

        await database.connect();
        const query = `
            SELECT p.name, p.resource, p.action
            FROM roles r
            JOIN role_permissions rp ON r.id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE r.name = ?
        `;
        
        const permissions = await database.query(query, [roleName]);
        
        // Actualizează cache-ul
        permissionsCache[cacheKey] = permissions;
        cacheExpiry = now + CACHE_DURATION;
        
        return permissions;
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        return [];
    }
};

// Funcție pentru a verifica dacă un rol are o anumită permisiune
const hasPermission = async (roleName, permissionName) => {
    try {
        const permissions = await getRolePermissions(roleName);
        return permissions.some(p => p.name === permissionName);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
};

// Funcție pentru a verifica permisiuni pe resurse și acțiuni
const hasResourcePermission = async (roleName, resource, action) => {
    try {
        const permissions = await getRolePermissions(roleName);
        return permissions.some(p => p.resource === resource && p.action === action);
    } catch (error) {
        console.error('Error checking resource permission:', error);
        return false;
    }
};

// Funcție pentru a obține toate rolurile din baza de date
const getAllRoles = async () => {
    try {
        await database.connect();
        const roles = await database.query('SELECT * FROM roles ORDER BY name');
        return roles;
    } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
    }
};

// Funcție pentru a obține ID-ul unui rol
const getRoleId = async (roleName) => {
    try {
        await database.connect();
        const result = await database.query('SELECT id FROM roles WHERE name = ?', [roleName]);
        return result.length > 0 ? result[0].id : null;
    } catch (error) {
        console.error('Error fetching role ID:', error);
        return null;
    }
};

// Curăță cache-ul de permisiuni
const clearPermissionsCache = () => {
    permissionsCache = {};
    cacheExpiry = 0;
};

module.exports = {
    ROLES,
    getRolePermissions,
    hasPermission,
    hasResourcePermission,
    getAllRoles,
    getRoleId,
    clearPermissionsCache
};
