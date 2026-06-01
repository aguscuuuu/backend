import { logger } from '../config/logger.js';

export const loggerHttp = (req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
};
