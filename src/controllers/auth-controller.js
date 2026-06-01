import passport from '../config/passport.js';
import { userManager } from '../managers/user-manager.js';
import { generateToken, getCookieOptions } from '../utils/jwt.js';

// POST /api/v1/auth/register
export const register = async (req, res, next) => {
    try {
        const user = await userManager.register(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Usuario registrado exitosamente',
            data: user,
        });
    } catch (error) {
        error.status = 400;
        next(error);
    }
};

// POST /api/v1/auth/login  (Passport Local + JWT)
export const login = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: info?.message || 'Credenciales inválidas',
            });
        }

        const token = generateToken(user);

        req.session.user = {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            isAdmin: user.role === 'admin',
        };

        res.cookie('authToken', token, getCookieOptions());

        res.status(200).json({
            status: 'success',
            message: 'Login exitoso',
            token,
            data: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
            },
        });
    })(req, res, next);
};

// GET /api/v1/auth/logout
export const logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('authToken');
        res.clearCookie('connect.sid');
        res.status(200).json({
            status: 'success',
            message: 'Sesión cerrada. El cliente debe eliminar el token JWT almacenado localmente.',
        });
    });
};

// GET /api/v1/auth/github/callback  (handler post-OAuth)
export const githubCallback = (req, res) => {
    const token = generateToken(req.user);

    req.session.user = {
        id: req.user._id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        role: req.user.role,
        isAdmin: req.user.role === 'admin',
    };

    res.cookie('authToken', token, getCookieOptions());
    res.redirect('/');
};

// GET /api/v1/session
export const getSession = (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({
            status: 'error',
            message: 'No hay sesión activa',
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: req.session.user,
            sessionId: req.sessionID,
        },
    });
};

// GET /api/v1/profile  (protegida por JWT)
export const getProfile = async (req, res, next) => {
    try {
        const user = await userManager.getById(req.user.userId);
        res.status(200).json({
            status: 'success',
            data: {
                id: user._id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                age: user.age,
            },
        });
    } catch (error) {
        error.status = 404;
        next(error);
    }
};

// GET /api/v1/admin  (protegida por JWT + rol admin)
export const getAdmin = async (req, res, next) => {
    try {
        const users = await userManager.getUsers();
        res.status(200).json({
            status: 'success',
            message: 'Panel de administración',
            data: {
                adminId: req.user.userId,
                totalUsers: users.length,
                users,
            },
        });
    } catch (error) {
        next(error);
    }
};
