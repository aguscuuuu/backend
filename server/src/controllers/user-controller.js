import { userManager } from "../managers/user-manager.js";

//* obtener todos los usuarios
export const getAllUsers = async (req, res) => {
    try {
        const users = await userManager.getUsers();
        res.status(200).json({
        status: "success",
        data: users
        });
    } catch (error) {
        res.status(500).json({
        status: "error",
        message: error.message
        });
    }
};

//* obtener un usuario por id
export const getUserById = async (req, res) => {
    try {
        const { uid } = req.params;
        const user = await userManager.getById(uid);
        res.status(200).json({
        status: "success",
        data: user
        });
    } catch (error) {
        res.status(404).json({
        status: "error",
        message: error.message
        });
    }
};

//* registrar un nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const user = await userManager.register(req.body);
        res.status(201).json({
        status: "success",
        message: "Usuario registrado exitosamente.",
        data: user
        });
    } catch (error) {
        res.status(400).json({
        status: "error",
        message: error.message
        });
    }
};

//* login de usuario
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
        return res.status(400).json({
            status: "error",
            message: "Email y contraseña son requeridos."
        });
        }

        const user = await userManager.login(email, password);
    
        res.status(200).json({
            status: "success",
            message: "Login exitoso.",
            data: user
            // token: token
            });
    } catch (error) {
            res.status(401).json({
            status: "error",
            message: error.message
        });
    }
};

//* actualizar un usuario
export const updateUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const updatedUser = await userManager.update(uid, req.body);
        res.status(200).json({
        status: "success",
        message: "Usuario actualizado exitosamente.",
        data: updatedUser
        });
    } catch (error) {
        res.status(400).json({
        status: "error",
        message: error.message
        });
    }
};

//* eliminar un usuario
export const deleteUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const message = await userManager.delete(uid);
        res.status(200).json({
        status: "success",
        message: message
        });
    } catch (error) {
        res.status(404).json({
        status: "error",
        message: error.message
        });
    }
};