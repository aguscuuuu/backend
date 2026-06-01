import { connect } from 'mongoose';
import { logger } from './logger.js';

export const initMongoDB = async () => {
    try {
        await connect(process.env.MONGO_URL);
        logger.info('MongoDB conectado exitosamente.');
    } catch (error) {
        logger.error(`Error al conectar con MongoDB: ${error.message}`);
        throw new Error(error);
    }
};
