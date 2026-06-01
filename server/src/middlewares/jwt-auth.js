import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
    const tokenFromCookie = req.cookies?.authToken;
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado. Token no proporcionado.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Token inválido o expirado.'
        });
    }
};

export const requireRole = (role) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No autenticado.'
        });
    }

    if (req.user.role !== role) {
        return res.status(403).json({
            status: 'error',
            message: `Acceso denegado. Se requiere rol '${role}'.`
        });
    }

    next();
};
