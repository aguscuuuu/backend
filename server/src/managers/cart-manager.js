import { CartModel } from "../models/cart-model.js";
import { ProductModel } from "../models/product-model.js";

class CartManager {

    //* obtiene todos los carts y los devuelve como un array
    getAll = async () => {
        try {
            const carts = await CartModel.find().populate('products.product');
            return carts;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* obtiene un cart por su id y lo devuelve
    getOne = async (id) => {
        try {
            const cart = await CartModel.findById(id).populate('products.product');
            if (!cart) throw new Error("Cart not found");
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* crea un carrito
    create = async () => {
        try {
            const cart = await CartModel.create({ products: [] });
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* agrega un producto al carrito
    addProdToCart = async (cartId, productId) => {
        try {
            // verifica que el producto exista
            const product = await ProductModel.findById(productId);
            if (!product) throw new Error("Product not found");

            // busca el carrito
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error("Cart not found");

            // busca si el producto ya está en el carrito
            const prodInCart = cart.products.find(
                p => p.product.toString() === productId
            );

            if (prodInCart) {
                // si ya existe, incrementa la cantidad
                prodInCart.quantity++;
            } else {
                // si no existe, lo agrega con cantidad 1
                cart.products.push({
                    product: productId,
                    quantity: 1
                });
            }

            await cart.save();
            
            // devuelve el carrito con los productos poblados
            return await cart.populate('products.product');
        } catch (error) {
            throw new Error(error);
        }
    }

    //* elimina un producto del carrito
    removeProdFromCart = async (cartId, productId) => {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error("Cart not found");

            cart.products = cart.products.filter(
                p => p.product.toString() !== productId
            );

            await cart.save();
            return await cart.populate('products.product');
        } catch (error) {
            throw new Error(error);
        }
    }

    //* vacía el carrito
    clearCart = async (cartId) => {
        try {
            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: [] },
                { new: true }
            );
            if (!cart) throw new Error("Cart not found");
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const cartManager = new CartManager();