import { Router } from "express";
import { 
    getProductsView, 
    getProductDetailView, 
    getCartView 
} from "../controllers/views-controller.js";

const router = Router();

// Vista de productos con paginación
router.get("/products", getProductsView);

// Vista de detalle de producto
router.get("/products/:pid", getProductDetailView);

// Vista del carrito
router.get("/carts/:cid", getCartView);

export { router };