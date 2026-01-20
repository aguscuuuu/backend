import { cartManager } from "../managers/cart-manager.js";

// obtener todos los carritos
export const getAllCarts = async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.status(200).json({
        status: "success",
        data: carts
        });
    } catch (error) {
        res.status(500).json({
        status: "error",
        message: error.message
        });
    }
};

// obtener un carrito por id
export const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.getOne(cid);
        res.status(200).json({
        status: "success",
        data: cart
        });
    } catch (error) {
        res.status(404).json({
        status: "error",
        message: error.message
        });
    }
};

// crear un carrito nuevo
export const createCart = async (req, res) => {
    try {
        const cart = await cartManager.create();
        res.status(201).json({
        status: "success",
        message: "Carrito creado exitosamente",
        data: cart
        });
    } catch (error) {
        res.status(500).json({
        status: "error",
        message: error.message
        });
    }
};

// agregar un producto al carrito
export const addProductToCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.addProdToCart(cid, pid);
        res.status(200).json({
        status: "success",
        message: "Producto agregado al carrito",
        data: cart
        });
    } catch (error) {
        res.status(400).json({
        status: "error",
        message: error.message
        });
    }
};

// eliminar un producto del carrito
export const removeProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartManager.removeProdFromCart(cid, pid);
        res.status(200).json({
        status: "success",
        message: "Producto eliminado del carrito",
        data: cart
        });
    } catch (error) {
        res.status(400).json({
        status: "error",
        message: error.message
        });
    }
};

// vaciar el carrito
export const clearCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartManager.clearCart(cid);
        res.status(200).json({
        status: "success",
        message: "Carrito vaciado exitosamente",
        data: cart
        });
    } catch (error) {
        res.status(400).json({
        status: "error",
        message: error.message
        });
    }
};