import dotenv from "dotenv";
dotenv.config(); // carga las variables del .env

import express from "express";
import { router as productsRouter } from "./routes/products-router.js";
import { router as cartsRouter } from "./routes/carts-router.js";
import { router as usersRouter } from "./routes/users-router.js"; 
import handlebars from "express-handlebars";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // para formularios
//app.use(express.static(`${process.cwd()}./src/public`));

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
//app.set("views", `${process.cwd()}/src/views`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter); 

app.get("/", (req, res) => res.send(`API en funcionamiento. Rutas disponibles: /api/products, /api/carts, /api/users`));

export default app;