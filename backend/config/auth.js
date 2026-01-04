require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    jwtExpire: process.env.JWT_EXPIRE || '1h',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',

    // Token options
    tokenOptions: {
        access: {
            expiresIn: process.env.JWT_EXPIRE || '1h',
        },
        refresh: {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
        },
    },

    // Roles
    roles: {
        CITIZEN: 'CITIZEN',
        COORDINATOR: 'COORDINATOR',
        ADMIN: 'ADMIN',
    },

    // Role hierarchy (higher number = more permissions)
    roleHierarchy: {
        CITIZEN: 1,
        COORDINATOR: 2,
        ADMIN: 3,
    },
};
