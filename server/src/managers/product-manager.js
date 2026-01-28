import { ProductModel } from "../models/product-model.js";

class ProductManager {
    
    //* obtiene todos los productos con paginación, filtros y ordenamiento
    getAll = async (queryParams = {}) => {
        try {
            const { 
                limit = 12, 
                page = 1, 
                sort, 
                query 
            } = queryParams;
            // construir filtro
            let filter = {};
            if (query) {
                if (query === 'available') {
                    filter = { status: true };
                } else if (query === 'unavailable') {
                    filter = { status: false };
                } else {
                    filter = { category: query };
                }
            }
            // construir opciones de ordenamiento
            let sortOption = {};
            if (sort === 'asc') {
                sortOption = { price: 1 };
            } else if (sort === 'desc') {
                sortOption = { price: -1 };
            }
            // ejecutar query con paginación
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sortOption,
                lean: true
            };
            const result = await ProductModel.paginate(filter, options);
            // construir links de navegación
            const baseUrl = '/'; 
            const buildLink = (pageNum) => {
                if (!pageNum) return null;
                let link = `${baseUrl}?page=${pageNum}&limit=${limit}`;
                if (sort) link += `&sort=${sort}`;
                if (query) link += `&query=${query}`;
                return link;
            };
            return {
                status: "success",
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: buildLink(result.prevPage),
                nextLink: buildLink(result.nextPage)
            };
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