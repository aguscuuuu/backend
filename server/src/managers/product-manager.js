import { ProductModel } from "../models/product-model.js";

class ProductManager {
    
    //* obtiene todos los productos y los devuelve como un array
    getAll = async () => {
        try {
            const products = await ProductModel.find();
            return products;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* obtiene un producto por su id y lo devuelve
    getOne = async (id) => {
        try {
            const product = await ProductModel.findById(id);
            if (!product) throw new Error("Producto no encontrado.");
            return product;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* crea un producto
    create = async (obj) => {
        try {
            // mongoose valida automáticamente los campos requeridos según el schema
            const product = await ProductModel.create(obj);
            return product;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* actualiza un producto
    update = async (obj, id) => {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                obj,
                { new: true, runValidators: true }
                // new: true -> devuelve el producto actualizado
                // runValidators: true -> valida los datos según el schema
            );
            if (!updatedProduct) throw new Error("Producto no encontrado.");
            return updatedProduct;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* elimina un producto
    delete = async (id) => {
        try {
            const product = await ProductModel.findByIdAndDelete(id);
            if (!product) throw new Error("Producto no encontrado.");
            return `Producto: ${product._id} eliminado.`;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const productManager = new ProductManager();