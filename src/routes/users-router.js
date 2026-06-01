import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUser,
    deleteUser
} from "../controllers/user-controller.js";
import { authLimiter, apiLimiter } from "../middlewares/rate-limiters.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que obtiene todos los usuarios ------------------------------------------------------------------------------------------
router.get("/", apiLimiter, getAllUsers);

//* ruta http que registra un nuevo usuario -------------------------------------------------------------------------------------------
router.post("/register", authLimiter, registerUser);

//* ruta http que hace login de un usuario --------------------------------------------------------------------------------------------
router.post("/login", authLimiter, loginUser);

//* ruta http que obtiene un usuario por su id ----------------------------------------------------------------------------------------
router.get("/:uid", apiLimiter, getUserById);

//* ruta http que actualiza un usuario existente --------------------------------------------------------------------------------------
router.put("/:uid", apiLimiter, updateUser);

//* ruta http que elimina un usuario --------------------------------------------------------------------------------------------------
router.delete("/:uid", apiLimiter, deleteUser);

export { router };