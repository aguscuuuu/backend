import './src/config/env.js';
import { logger } from './src/config/logger.js';
import app from './src/app.js';
import { initMongoDB } from './src/config/connection.js';
import { Server } from 'socket.io';
import http from 'http';
import { productManager } from './src/managers/product-manager.js';
import open from 'open';

const PORT = process.env.PORT;

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set('io', io);

io.on('connection', async (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`);

    socket.on('requestProducts', async (params = {}) => {
        try {
            const { page = 1, limit = 12, sort, query } = params;
            const result = await productManager.getAll({ page, limit, sort, query });
            socket.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                },
            });
        } catch (error) {
            socket.emit('error', 'Error al cargar productos');
        }
    });

    socket.on('addProduct', async (productData) => {
        try {
            await productManager.create(productData);
            const result = await productManager.getAll({ limit: 12, page: 1 });
            io.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                },
            });
            socket.emit('productAdded', 'Producto agregado exitosamente');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.delete(productId);
            const result = await productManager.getAll({ limit: 12, page: 1 });
            io.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage,
                },
            });
            socket.emit('productDeleted', 'Producto eliminado exitosamente');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`);
    });
});

initMongoDB();

httpServer.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
    open(`https://cloud.mongodb.com/v2/6937689a65392c2e1da8aa2f#/explorer/6937693187a3156bcbc3c49d/backend`);
});

