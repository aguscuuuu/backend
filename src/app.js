import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import handlebars from 'express-handlebars';

import passport from './config/passport.js';
import { loggerHttp } from './middlewares/logger-http.js';
import { errorHandler } from './middlewares/error-handler.js';

import { router as productsRouter } from './routes/products-router.js';
import { router as cartsRouter } from './routes/carts-router.js';
import { router as usersRouter } from './routes/users-router.js';
import { router as viewsRouter } from './routes/views-router.js';
import { router as authV1Router } from './routes/auth-router.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./src/public'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        ttl: 60 * 60 * 24,
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
    },
}));

app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', handlebars.engine({
    helpers: {
        multiply: (a, b) => a * b,
        currentYear: () => new Date().getFullYear(),
        // texto del cartel de disponibilidad segun stock
        stockLabel: (stock) => {
            if (stock <= 0) return 'Agotado';
            if (stock === 1) return '¡Última unidad!';
            if (stock < 10) return `¡Últimas ${stock} unidades!`;
            return 'Disponible';
        },
        // color del cartel segun stock
        stockColor: (stock) => {
            if (stock <= 0) return '#dc3545';
            if (stock < 10) return '#ec9a00';
            return '#28a745';
        },
    },
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.use(loggerHttp);

// api v1 (autenticación híbrida)
app.use('/api/v1', authV1Router);

// api legacy
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/users', usersRouter);

// rutas de vistas
app.use('/', viewsRouter);

app.use(errorHandler);

export default app;
