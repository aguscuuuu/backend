import { v4 as uuidv4 } from "uuid";
import { productManager } from "./product-manager.js";
import fs from "fs"; // librería file system

class CartManager {

    constructor(path){
        this.path = path;
    }    

    //* obtiene todos los carts y los devuelve como un array --------------------------------------------------------------------------
    getAll = async () => {
        try{
            if(fs.existsSync(this.path)){ // verifica si el archivo existe
                const carts = await fs.promises.readFile(this.path, "utf-8"); // lee el contenido completo del archivo como texto
                return JSON.parse(carts); // convierte el texto a json
            }
            return []; // sino retorna un array vacío
        }catch(error){
            throw new Error(error);
        }
    }

    //* obtiene un cart por su id y lo devuelve como array ----------------------------------------------------------------------------
    getOne = async (id) => {
        try{
            const carts = await this.getAll(); // carga todos los productos
            const cartExists = carts.find((cart) => cart.id === id); // busca el producto solicitado
            if(!cartExists) throw new Error("Cart not found"); // si el carrito no existe lanza error
            return cartExists; // sino, lo retorna
        }catch(error){
            throw new Error(error);
        }
    }

    //* crea un carrito ---------------------------------------------------------------------------------------------------------------
    create = async () => {
        try {
            const cart = {
                id: uuidv4(), // genera un id único para el carrito
                products: [] // inicializa el carrito con un array vacío de productos
            };
            const carts = await this.getAll(); // obtiene todos los carritos almacenados en el archivo
            carts.push(cart); // agrega el nuevo carrito al array de carritos existentes
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2)); // sobrescribe el archivo con el nuevo array actualizado, formatea el JSON con indentación para que quede legible
            return cart; // devuelve el carrito recién creado
        } catch (error) {
            throw new Error(error);
        }
    };

    //* agrega un producto al carrito -------------------------------------------------------------------------------------------------
    addProdToCart = async (cartId, productId) => {
        try {
            const carts = await this.getAll(); // obtiene todos los carritos desde el archivo
            const cartIndex = carts.findIndex(c => c.id === cartId); // busca el índice del carrito cuyo id coincide con cartId
            if (cartIndex === -1) throw new Error("Cart not found"); // si no existe un carrito con ese id, lanza un error
            const cart = carts[cartIndex]; // guarda el carrito encontrado para trabajar sobre él
            await productManager.getOne(productId); // intenta obtener el producto; si no existe, getOne lanza error, evitando agregar productos inexistentes
            if (!Array.isArray(cart.products)) cart.products = []; // si por alguna razón la propiedad products no es un array, la inicializa correctamente para evitar errores
            const prodInCart = cart.products.find(p => p.product === productId); // busca dentro del carrito si el producto ya fue agregado antes
            if (prodInCart) { // si el producto ya estaba en el carrito, incrementa la cantidad
                prodInCart.quantity++;
            } else { // si es la primera vez que se agrega este producto,
                cart.products.push({
                    product: productId,
                    quantity: 1 // lo inserta con cantidad inicial 1
                });
            }
            carts[cartIndex] = cart; // reemplaza el carrito modificado en el array original
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));  // sobrescribe el archivo con la lista de carritos actualizada
            return cart; // devuelve el carrito actualizado
        } catch (error) {
            throw new Error(error);
        }
    };
}

export const cartManager = new CartManager("./data/carts.json");