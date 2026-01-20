import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    registerUser,
    loginUser,
    updateUser,
    deleteUser
} from "../controllers/user-controller.js";

const router = Router(); // se crea una instancia de router para definir rutas

//* ruta http que obtiene todos los usuarios ------------------------------------------------------------------------------------------
router.get("/", getAllUsers);

//* ruta http que registra un nuevo usuario -------------------------------------------------------------------------------------------
router.post("/register", registerUser);

//* ruta http que hace login de un usuario --------------------------------------------------------------------------------------------
router.post("/login", loginUser);

//* ruta http que obtiene un usuario por su id ----------------------------------------------------------------------------------------
router.get("/:uid", getUserById);

//* ruta http que actualiza un usuario existente --------------------------------------------------------------------------------------
router.put("/:uid", updateUser);

//* ruta http que elimina un usuario --------------------------------------------------------------------------------------------------
router.delete("/:uid", deleteUser);

export { router };