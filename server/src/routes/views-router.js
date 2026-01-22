import { Router } from "express";
import { 
    getProductsView, 
    getProductDetailView, 
    getCartView 
} from "../controllers/views-controller.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* vista de productos con paginación --------------------------------------------------------------------------------------------------
router.get("/products", getProductsView);

//* vista de detalle de producto -------------------------------------------------------------------------------------------------------
router.get("/products/:pid", getProductDetailView);

//* vista del carrito ------------------------------------------------------------------------------------------------------------------
router.get("/carts/:cid", getCartView);

export { router };