import { Router } from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product-controller.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que obtiene todos los productos -----------------------------------------------------------------------------------------
router.get("/", getAllProducts);

//* ruta http que obtiene un producto por su id ---------------------------------------------------------------------------------------
router.get("/:pid", getProductById);

//* ruta http que crea un producto nuevo ----------------------------------------------------------------------------------------------
router.post("/", createProduct);

//* ruta http que actualiza un producto existente -------------------------------------------------------------------------------------
router.put("/:pid", updateProduct);

//* ruta http que elimina un producto -------------------------------------------------------------------------------------------------
router.delete("/:pid", deleteProduct);

export { router };