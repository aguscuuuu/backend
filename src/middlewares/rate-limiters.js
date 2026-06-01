import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { status: 'error', message: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { status: 'error', message: 'Demasiadas solicitudes. Intentá de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
