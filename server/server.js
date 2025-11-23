// arranca el servidor 
// importa app.js
// escucha el puerto 8080
// no contiene lógica de rutas ni de negocio
// es el entry point real del servidor, donde se ejecuta app.listen()

import express from "express";

const server = express();
const port = 8080;

server.use(express.json());