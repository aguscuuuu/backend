// gestiona la conexión con mongo db 
import { connect } from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

export const initMongoDB = async () => {
    try {
        await connect(MONGO_URL);
        console.log('MongoDB conectado exitosamente.');
    } catch (error) {
        console.log('Error al conectar con MongoDB: ', error.message);
        throw new Error(error);
    }
};
