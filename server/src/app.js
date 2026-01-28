import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import { router as productsRouter } from "./routes/products-router.js";
import { router as cartsRouter } from "./routes/carts-router.js";
import { router as usersRouter } from "./routes/users-router.js";
import { router as viewsRouter } from "./routes/views-router.js";
import handlebars from "express-handlebars";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_12345',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 60 * 60 * 24 // 1 día
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 día
    }
}));

// configurar handlebars
app.engine("handlebars", handlebars.engine({
    helpers: {
        multiply: (a, b) => a * b
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./server/src/views");

// rutas api
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);

// rutas de vistas
app.use("/", viewsRouter);

app.get("/", (req, res) => res.redirect('/products'));

export default app;