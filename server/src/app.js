import dotenv from "dotenv";
dotenv.config({ quiet: true });

import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import handlebars from "express-handlebars";

import passport from "./config/passport.js";

import { router as productsRouter } from "./routes/products-router.js";
import { router as cartsRouter } from "./routes/carts-router.js";
import { router as usersRouter } from "./routes/users-router.js";
import { router as viewsRouter } from "./routes/views-router.js";
import { router as authV1Router } from "./routes/auth-router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./server/src/public'));

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

app.use(passport.initialize());
app.use(passport.session());

// configurar handlebars
app.engine("handlebars", handlebars.engine({
    helpers: {
        multiply: (a, b) => a * b
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./server/src/views");

// api v1 (autenticación híbrida)
app.use("/api/v1", authV1Router);

// api legacy
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", usersRouter);

// rutas de vistas
app.use("/", viewsRouter);

app.get("/", (req, res) => res.redirect('/products'));

export default app;
