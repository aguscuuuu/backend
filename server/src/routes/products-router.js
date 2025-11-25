import { Router } from "express";
import { productManager } from "../managers/product-manager.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que obtiene todos los productos -----------------------------------------------------------------------------------------
router.get("/", async (req, res) => { 
    try{
        const products = await productManager.getAll(); // llama al método getAll() del productManager para leer todos los productos
        res.json(products); // responde con los productos obtenidos en formato JSON
    }catch(error){
        res.status(404).send(error.message);
    }
});
//* ruta http que obtiene un producto por su id ---------------------------------------------------------------------------------------
router.get("/:pid", async (req, res) => { 
    try{
        const { pid } = req.params; // extrae el parámetro pid desde req.params
        const product = await productManager.getOne(pid); // busca un único producto usando el id recibido
        res.json(product); // responde con los productos obtenidos en formato JSON
    }catch(error){
        res.status(404).send(error.message);
    }
});
//* ruta http que crea un producto nuevo ----------------------------------------------------------------------------------------------
router.post("/", async (req, res) => { 
    try{
        const newProduct = await productManager.create(req.body); // llama al método create() pasándole el cuerpo de la solicitud como datos del nuevo producto
        res.status(201).json(newProduct); // responde con estado 201 (creado) y el producto creado en formato JSON
    }catch(error){
        res.status(500).send(error.message);
    }
});
//* ruta http que actualiza un producto existente -------------------------------------------------------------------------------------
router.put("/:pid", async (req, res) => { 
    try{
        const { pid } = req.params; // extrae el id desde los parámetros de la URL
        const product = await productManager.update(req.body, pid); // envía los datos nuevos y el id al método update()
        res.json(product); // responde con el producto actualizado
    }catch(error){
        res.status(500).send(error.message);
    }
});
//* ruta http que elimina un producto -------------------------------------------------------------------------------------------------
router.delete("/:pid", async (req, res) => { 
    try{
        const { pid } = req.params; // obtiene el id del producto desde los parámetros
        const response = await productManager.delete(pid); // llama al método delete() para eliminar el producto
        res.json(response); // responde con el resultado de la operación
    }catch(error){
        res.status(500).send(error.message);
    }
});

export { router };