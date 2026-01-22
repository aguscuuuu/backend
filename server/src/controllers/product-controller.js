import { productManager } from "../managers/product-manager.js";

// obtener todos los productos
export const getAllProducts = async (req, res) => {
    try {
        // pasar los query params al manager
        const result = await productManager.getAll(req.query);
        res.status(200).json(result); 
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

// obtener un producto por id
export const getProductById = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getOne(pid);
        res.status(200).json({
            status: "success",
            data: product
        });
    } catch (error) {
        res.status(404).json({
            status: "error",
            message: error.message
        });
    }
};

// crear un producto
export const createProduct = async (req, res) => {
    try {
        const product = await productManager.create(req.body);
        res.status(201).json({
            status: "success",
            message: "Producto creado exitosamente",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// actualizar un producto
export const updateProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await productManager.update(req.body, pid);
        res.status(200).json({
            status: "success",
            message: "Producto actualizado exitosamente",
            data: updatedProduct
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// eliminar un producto
export const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const message = await productManager.delete(pid);
        res.status(200).json({
            status: "success",
            message: message
        });
    } catch (error) {
        res.status(404).json({
            status: "error",
            message: error.message
        });
    }
};