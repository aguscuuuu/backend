import express from "express";
import { router as productsRouter } from "./routes/products-router.js";
import { router as cartsRouter } from "./routes/carts-router.js";

const app = express();

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => res.send(`API en funcionamiento. Utilizar: /api/products o /api/carts`));

export default app;
