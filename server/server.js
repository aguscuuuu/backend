import app from "./src/app.js";
import { initMongoDB } from "./src/config/connection.js";
import { Server } from "socket.io";
import http from "http";
import { productManager } from "./src/managers/product-manager.js";
import open from "open";

const PORT = process.env.PORT || 8080;

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.set('io', io);

// socket.io eventos
io.on('connection', async (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);

    // enviar productos con paginación y filtros
    socket.on('requestProducts', async (params = {}) => {
        try {
            const { page = 1, limit = 12, sort, query } = params;
            
            const result = await productManager.getAll({ 
                page, 
                limit, 
                sort, 
                query 
            });
            
            socket.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage
                }
            });
        } catch (error) {
            socket.emit('error', 'Error al cargar productos');
        }
    });

    // agregar producto
    socket.on('addProduct', async (productData) => {
        try {
            await productManager.create(productData);
            
            // notificar a todos los clientes
            const result = await productManager.getAll({ limit: 12, page: 1 });
            io.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage
                }
            });
            
            socket.emit('productAdded', 'Producto agregado exitosamente');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    // eliminar producto
    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.delete(productId);
            
            // notificar a todos los clientes
            const result = await productManager.getAll({ limit: 12, page: 1 });
            io.emit('updateProducts', {
                products: result.payload,
                pagination: {
                    page: result.page,
                    totalPages: result.totalPages,
                    hasPrevPage: result.hasPrevPage,
                    hasNextPage: result.hasNextPage
                }
            });
            
            socket.emit('productDeleted', 'Producto eliminado exitosamente');
        } catch (error) {
            socket.emit('error', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.id);
    });
});

initMongoDB();

httpServer.listen(PORT, () => {
    console.log(`Servidor conectado en el puerto ${PORT}.`);
    console.log(`Ruta: http://localhost:${PORT}/`);
    open(`http://localhost:${PORT}`);
});