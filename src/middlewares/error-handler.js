import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';

    logger.error(`${req.method} ${req.url} → ${status}: ${message}`);

    res.status(status).json({
        status: 'error',
        message,
    });
};
