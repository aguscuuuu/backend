import { Router } from "express";
import {
    getAllCarts,
    getCartById,
    createCart,
    addProductToCart,
    removeProductFromCart,
    clearCart
} from "../controllers/cart-controller.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que obtiene todos los carritos ------------------------------------------------------------------------------------------
router.get("/", getAllCarts);

//* ruta http que crea un carrito nuevo -----------------------------------------------------------------------------------------------
router.post("/", createCart);

//* ruta http que obtiene un carrito por su id ----------------------------------------------------------------------------------------
router.get("/:cid", getCartById);

//* ruta http que agrega un producto al carrito ---------------------------------------------------------------------------------------
router.post("/:cid/product/:pid", addProductToCart);

//* ruta http que elimina un producto del carrito -------------------------------------------------------------------------------------
router.delete("/:cid/product/:pid", removeProductFromCart);

//* ruta http que vacía el carrito ----------------------------------------------------------------------------------------------------
router.delete("/:cid", clearCart);

export { router };