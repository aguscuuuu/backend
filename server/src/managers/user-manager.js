/*const fs = require("node:fs");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class UserManager {
    
    constructor(path) {
        this.path = path;
    }

    // obtiene todos los usuarios y los devuelve como un array -----------------------------------------------------------------------
    getUsers = async () => {
        try {
            if (fs.existsSync(this.path)) { // verifica si el archivo existe en la ruta dada
                const users = await fs.promises.readFile(this.path, "utf-8"); // lee el archivo completo como texto
                return JSON.parse(users); // convierte el texto en JSON y lo devuelve
            }
            return []; // si el archivo no existe, devuelve un array vacío
        } catch (error) {
            throw new Error(error); 
        }
    };

    // crea un nuevo usuario ---------------------------------------------------------------------------------------------------------
    register = async (obj) => {
        try {
            const users = await this.getUsers(); // obtiene todos los usuarios actuales del archivo
            if (!obj.email || !obj.password) { // valida que el objeto recibido tenga email y password
                throw new Error("Email and password are required");
            }
            if (users.some(u => u.email === obj.email)) { // verifica si existe un usuario con el mismo email
                throw new Error("Email already registered");
            }
            const user = {
                id: uuidv4(), // genera un id único para el nuevo usuario
                ...obj, // copia todas las propiedades del objeto recibido
                password: await bcrypt.hash(obj.password, 10) // hashea la contraseña antes de guardarla
            };
            users.push(user); // agrega el nuevo usuario al array de usuarios
            await fs.promises.writeFile(this.path, JSON.stringify(users, null, 2)); // sobrescribe el archivo con la lista actualizada, formatea el JSON para que sea legible
            return { id: user.id, email: user.email }; // devuelve información del usuario sin exponer la contraseña
        } catch (error) { 
            throw new Error(error);
        }
    };

    // logea un usuario --------------------------------------------------------------------------------------------------------------
    login = async (email, password) => {
        try{
            const users = await this.getUsers(); // obtiene todos los usuarios almacenados
            const user = users.find(u => u.email === email); // busca un usuario cuyo email coincida con el recibido
            if (!user) throw new Error("Invalid credentials"); // si no encuentra al usuario, lanza error
            const isValidPass = await bcrypt.compare(password, user.password); // compara la contraseña recibida con la contraseña hasheada almacenada
            if (!isValidPass) throw new Error("Invalid credentials"); // si la contraseña no coincide, lanza error
            return { id: user.id, email: user.email }; // devuelve datos del usuario sin la contraseña
        }catch(error){
            throw new Error(error);
        }
    };
}

export const userManager = new UserManager("./data/users.json");*/