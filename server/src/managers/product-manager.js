import { ProductModel } from "../models/product-model.js";

class ProductManager {
    
    //* obtiene todos los productos con paginación, filtros y ordenamiento
    getAll = async (queryParams = {}) => {
        try {
            // Extraer parámetros con valores por defecto
            const { 
                limit = 10, 
                page = 1, 
                sort, 
                query 
            } = queryParams;

            // Construir filtro
            let filter = {};
            if (query) {
                // Filtrar por disponibilidad
                if (query === 'available') {
                    filter = { status: true };
                } else if (query === 'unavailable') {
                    filter = { status: false };
                } else {
                    // Filtrar por categoría
                    filter = { category: query };
                }
            }

            // Construir opciones de ordenamiento
            let sortOption = {};
            if (sort === 'asc') {
                sortOption = { price: 1 };
            } else if (sort === 'desc') {
                sortOption = { price: -1 };
            }

            // Ejecutar query con paginación
            const options = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: sortOption,
                lean: true // Devuelve objetos planos en vez de documentos Mongoose
            };

            const result = await ProductModel.paginate(filter, options);

            // Construir links de navegación
            const baseUrl = '/api/products';
            const buildLink = (pageNum) => {
                if (!pageNum) return null;
                let link = `${baseUrl}?page=${pageNum}&limit=${limit}`;
                if (sort) link += `&sort=${sort}`;
                if (query) link += `&query=${query}`;
                return link;
            };

            // Retornar en el formato solicitado
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
            if (!product) throw new Error("Product not found");
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
            if (!updatedProduct) throw new Error("Product not found");
            return updatedProduct;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* elimina un producto
    delete = async (id) => {
        try {
            const product = await ProductModel.findByIdAndDelete(id);
            if (!product) throw new Error("Product not found");
            return `Producto: ${product._id} eliminado`;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const productManager = new ProductManager();