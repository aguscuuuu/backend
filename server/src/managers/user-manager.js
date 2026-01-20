import { UserModel } from "../models/user-model.js";
import bcrypt from "bcrypt";

class UserManager {

    //* obtiene todos los usuarios y los devuelve como un array
    getUsers = async () => {
        try {
            const users = await UserModel.find().select('-password');
            // .select('-password') → excluye la contraseña del resultado
            return users;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* obtiene un usuario por id
    getById = async (id) => {
        try {
            const user = await UserModel.findById(id).select('-password');
            if (!user) throw new Error("User not found");
            return user;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* obtiene un usuario por email (método útil)
    getByEmail = async (email) => {
        try {
            const user = await UserModel.findOne({ email });
            return user; // Devuelve null si no existe
        } catch (error) {
            throw new Error(error);
        }
    }

    //* crea un nuevo usuario (registro)
    register = async (obj) => {
        try {
            if (!obj.email || !obj.password) {
                throw new Error("Email and password are required");
            }

            // verifica si el email ya existe
            const existingUser = await UserModel.findOne({ email: obj.email });
            if (existingUser) {
                throw new Error("Email already registered");
            }

            // hashea la contraseña
            const hashedPassword = await bcrypt.hash(obj.password, 10);

            // crea el usuario
            const user = await UserModel.create({
                ...obj,
                password: hashedPassword
            });

            // devuelve el usuario sin la contraseña
            return {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    //* logea un usuario
    login = async (email, password) => {
        try {
            // busca el usuario por email
            const user = await UserModel.findOne({ email });
            if (!user) throw new Error("Invalid credentials");

            // compara la contraseña
            const isValidPass = await bcrypt.compare(password, user.password);
            if (!isValidPass) throw new Error("Invalid credentials");

            // devuelve datos del usuario sin la contraseña
            return {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            };
        } catch (error) {
            throw new Error(error);
        }
    }

    //* actualiza un usuario
    update = async (id, obj) => {
        try {
            // si se está actualizando la contraseña, hashearla
            if (obj.password) {
                obj.password = await bcrypt.hash(obj.password, 10);
            }

            const updatedUser = await UserModel.findByIdAndUpdate(
                id,
                obj,
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) throw new Error("User not found");
            return updatedUser;
        } catch (error) {
            throw new Error(error);
        }
    }

    //* elimina un usuario
    delete = async (id) => {
        try {
            const user = await UserModel.findByIdAndDelete(id);
            if (!user) throw new Error("User not found");
            return `Usuario ${user.email} eliminado`;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export const userManager = new UserManager();