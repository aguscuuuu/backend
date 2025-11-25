import fs from "fs"; // librería file system
import { v4 as uuidv4 } from "uuid"; // librería universally unique identifiers 

class ProductManager {
    
    constructor(path){
        this.path = path;
    }

    //* obtiene todos los productos y los devuelve como un array ----------------------------------------------------------------------
    getAll = async () => {
        try{
            if(fs.existsSync(this.path)){ // verifica si el archivo existe 
                const products = await fs.promises.readFile(this.path, "utf-8"); // lee el contenido completo del archivo como texto
                return JSON.parse(products); // convierte el texto a json
            }
            return []; // sino retorna un array vacío
        }catch(error){
            throw new Error(error);
        }
    }

    //* obtiene un producto por su id y lo devuelve como array ------------------------------------------------------------------------
    getOne = async (id) => {
        try{
            const products = await this.getAll(); // carga todos los productos 
            const productExists = products.find((product) => product.id === id); // busca el producto solicitado en la lista
            if (!productExists) throw new Error("Product not found"); // si el producto no existe lanza el error 
            return productExists; // sino, lo retorna
        }catch(error){
            throw new Error(error);
        }
    }

    //* crea un producto --------------------------------------------------------------------------------------------------------------
    create = async (obj) => {
        try {
            const requiredFields = ["title", "description", "code", "price", "status", "stock", "category"]; // define un array con los campos obligatorios que todo producto debe tener
            for (const field of requiredFields) { // recorre cada campo obligatorio 
                if (!obj[field]) { // si falta alguno
                    throw new Error(`Field '${field}' is required`); // lanza un error
                }
            }
            const product = {
                id: uuidv4(), // genera un id único para el nuevo producto
                thumbnails: obj.thumbnails ?? [],  // si el objeto recibido trae thumbnails lo usa; si no, asigna un array vacío
                ...obj, // copia todas las propiedades del objeto recibido al nuevo producto
            }; 
            const products = await this.getAll();  // obtiene todos los productos actuales del archivo
            products.push(product); // agrega el nuevo producto al array existente
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2)); // sobrescribe el archivo con el array actualizado, formateado con indentación de 2 espacios
            return product; // devuelve el producto recién creado
        } catch (error) {
            throw new Error(error);
        }
    };

    //* actualiza un producto ---------------------------------------------------------------------------------------------------------
    update = async (obj, id) => {
        try {
            const products = await this.getAll(); // obtiene todos los productos actuales desde el archivo
            const index = products.findIndex(prod => prod.id === id); // busca el índice del producto cuyo id coincide con el recibido, si no encuentra ninguno, findIndex devuelve -1
            if (index === -1) throw new Error("Product not found"); // si no existe un producto con ese id, lanza un error
            products[index] = { // crea un nuevo objeto combinando el producto original
                ...products[index],
                ...obj // con las propiedades nuevas que vengan en obj (sobrescribiendo las que coincidan)
            };
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2)); // sobrescribe el archivo con el array actualizado de productos
            return products[index]; // devuelve el producto actualizado
        }catch (error) {
            throw new Error(error);
        }
    };

    //* elimina un producto -----------------------------------------------------------------------------------------------------------
    delete = async (id) => {
        try{
            const product = await this.getOne(id); // verifica que el producto exista 
            const products = await this.getAll(); // obtiene los productos actuales 
            const newArray = products.filter((prod) => prod.id !== id); // filtra el producto a eliminar 
            await fs.promises.writeFile(this.path, JSON.stringify(newArray, null, 2)); // sobreescribe el archivo con la lista con el producto eliminado
            return `Producto: ${product.id} eliminado`; // devuelve el mensaje 
        }catch(error){
            throw new Error(error);
        }
    }
}

export const productManager = new ProductManager("./data/products.json");