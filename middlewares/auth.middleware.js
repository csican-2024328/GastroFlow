import jwt from 'jsonwebtoken';

export const autenticar = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Por favor inicia sesión.'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                issuer: process.env.JWT_ISSUER,
                audience: process.env.JWT_AUDIENCE
            }
        );
        req.usuario = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicia sesión nuevamente.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error en la verificación del token',
            error: error.message
        });
    }
};

export const autorizarRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.role)) {
            return res.status(403).json({
                success: false,
                message: `No tienes permiso para acceder a este recurso. Rol requerido: ${rolesPermitidos.join(', ')}`
            });
        }

        next();
    };
};

export const autenticarOpcional = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    issuer: process.env.JWT_ISSUER,
                    audience: process.env.JWT_AUDIENCE
                }
            );
            req.usuario = decoded;
        }

        next();
    } catch (error) {
        next();
    }
};

export const isAdmin = (req, res, next) => {
    autenticar(req, res, () => {
        if (!['PLATFORM_ADMIN', 'RESTAURANT_ADMIN'].includes(req.usuario.role)) {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden acceder a este recurso',
                requiredRole: ['PLATFORM_ADMIN', 'RESTAURANT_ADMIN'],
                userRole: req.usuario.role
            });
        }
        next();
    });
};

export const isPlatformAdmin = (req, res, next) => {
    autenticar(req, res, () => {
        if (req.usuario.role !== 'PLATFORM_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores de plataforma pueden acceder a este recurso',
                requiredRole: 'PLATFORM_ADMIN',
                userRole: req.usuario.role
            });
        }
        next();
    });
};

export const isRestaurantAdmin = (req, res, next) => {
    autenticar(req, res, () => {
        if (req.usuario.role !== 'RESTAURANT_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores de restaurante pueden acceder a este recurso',
                requiredRole: 'RESTAURANT_ADMIN',
                userRole: req.usuario.role
            });
        }
        next();
    });
};

export const isClient = (req, res, next) => {
    autenticar(req, res, () => {
        if (req.usuario.role !== 'CLIENT') {
            return res.status(403).json({
                success: false,
                message: 'Solo clientes pueden acceder a este recurso',
                requiredRole: 'CLIENT',
                userRole: req.usuario.role
            });
        }
        next();
    });
};
