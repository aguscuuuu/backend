// gestiona la conexión con mongo db
import { connect } from "mongoose";

export const initMongoDB = async () => {
    const MONGO_URL = process.env.MONGO_URL;
    try {
        await connect(MONGO_URL);
        console.log('MongoDB conectado exitosamente.');
    } catch (error) {
        console.log('Error al conectar con MongoDB: ', error.message);
        throw new Error(error);
    }
};
