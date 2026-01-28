import { Router } from "express";
import { 
    getHomeView,
    getRealTimeProductsView,
    getProductDetailView, 
    getCartView 
} from "../controllers/views-controller.js";
import { logoutUser } from "../controllers/user-controller.js";
import { isAuthenticated, isNotAuthenticated, isNotAdmin } from "../middlewares/auth.js";

const router = Router();

// vistas de autenticación
router.get("/login", isNotAuthenticated, (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

router.get("/register", isNotAuthenticated, (req, res) => {
    res.render('register', { title: 'Crear Cuenta' });
});

router.get("/logout", logoutUser);

// home - página principal (solo para usuarios normales)
router.get("/", isNotAdmin, getHomeView);  
router.get("/home", isNotAdmin, getHomeView);  

// panel admin - (solo admin)
router.get("/realtimeproducts", getRealTimeProductsView);

// detalle de producto (ambos pueden ver)
router.get("/products/:pid", getProductDetailView);

// carrito (solo usuarios normales)
router.get("/carts/:cid", isNotAdmin, getCartView);

export { router };