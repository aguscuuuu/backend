import { Router } from "express";
import { cartManager } from "../managers/cart-manager.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que crea un carrito vacío -----------------------------------------------------------------------------------------------
router.post("/", async(req, res) => {
    try{
        const newCart = await cartManager.create();
        res.status(201).json(newCart);
    }catch(error){
        res.status(500).send(error.message);
    }
});
//* ruta http que devuelve un carrito por id ------------------------------------------------------------------------------------------
router.get("/:cid", async(req, res) => {
    try{
        const { cid } = req.params;
        const cart = await cartManager.getOne(cid);
        res.json(cart);
    }catch(error){
        res.status(404).send(error.message);
    }
});
//* ruta http que agrega un producto a un carrito -------------------------------------------------------------------------------------
router.post("/:cid/product/:pid", async(req, res) => {
    try{
        const { cid , pid } = req.params;
        const result = await cartManager.addProdToCart(cid, pid);
        res.json(result);
    }catch(error){
        res.status(400).send(error.message);
    }
});
//* ruta http para listar todos los carritos ------------------------------------------------------------------------------------------
router.get("/", async (req, res) => {
    try {
        const carts = await cartManager.getAll();
        res.json(carts);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

export { router };