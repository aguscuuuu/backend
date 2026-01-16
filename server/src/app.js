import express from "express";
import { router as productsRouter } from "./routes/products-router.js";
import { router as cartsRouter } from "./routes/carts-router.js";
import handlebars from "express-handlebars";

const app = express();

app.use(express.json());
//app.use(express.static(`${process.cwd()}./src/public`));
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
//app.set("views" ...)

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => res.send(`API en funcionamiento. Utilizar: /api/products o /api/carts`));

export default app;
