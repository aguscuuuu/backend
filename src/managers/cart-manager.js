import { Types } from "mongoose";
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
            const product = await ProductModel.findById(productId);
            if (!product) throw new Error("Product not found");

            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error("Cart not found");

            const prodInCart = cart.products.find(
                p => p.product.toString() === productId
            );

            if (prodInCart) {
                prodInCart.quantity++;
            } else {
                cart.products.push({
                    product: productId,
                    quantity: 1
                });
            }

            await cart.save();
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

    //* actualiza todo el carrito con un array de productos
    updateCart = async (cartId, products) => {
        try {
            if (!Array.isArray(products)) throw new Error("Products must be an array");

            const sanitized = products.map(item => {
                if (typeof item !== 'object' || item === null) throw new Error("Invalid product entry");
                const { product, quantity } = item;
                if (typeof product !== 'string' || !Types.ObjectId.isValid(product)) throw new Error("Invalid product id");
                if (typeof quantity !== 'number' || quantity < 1) throw new Error("Invalid quantity");
                return { product, quantity };
            });

            const cart = await CartModel.findByIdAndUpdate(
                cartId,
                { products: sanitized },
                { new: true }
            ).populate('products.product');
            if (!cart) throw new Error("Cart not found");
            return cart;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* actualiza la cantidad de un producto específico en el carrito
    updateProductQuantity = async (cartId, productId, quantity) => {
        try {

            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error("Cart not found");

            const productInCart = cart.products.find(
                p => p.product.toString() === productId
            );

            if (!productInCart) {
                throw new Error("Product not found in cart");
            }

            productInCart.quantity = quantity;
            await cart.save();
            
            return await cart.populate('products.product');
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const cartManager = new CartManager();