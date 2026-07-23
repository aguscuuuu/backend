import { Router } from 'express';
import passport from '../config/passport.js';
import { authLimiter, apiLimiter } from '../middlewares/rate-limiters.js';
import {
    register,
    login,
    logout,
    githubCallback,
    getSession,
    getProfile,
    getAdmin
} from '../controllers/auth-controller.js';
import { verifyJWT, requireRole } from '../middlewares/jwt-auth.js';

const router = Router();


// ── auth ──────────────────────────────────────────────
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.get('/auth/logout', logout);

// ── oauth github ──────────────────────────────────────
const isGithubConfigured = () =>
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'tu_github_client_id';

router.get('/auth/github', authLimiter, (req, res, next) => {
    if (!isGithubConfigured()) {
        return res.status(503).json({ status: 'error', message: 'OAuth GitHub no configurado. Agregar GITHUB_CLIENT_ID y GITHUB_CLIENT_SECRET al .env' });
    }
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});
router.get('/auth/github/callback', authLimiter, (req, res, next) => {
    if (!isGithubConfigured()) return res.redirect('/login');
    passport.authenticate('github', { failureRedirect: '/login' })(req, res, next);
}, githubCallback);

// ── sesión ────────────────────────────────────────────
router.get('/session', getSession);

// ── rutas protegidas ──────────────────────────────────
// 401 si no hay token válido
router.get('/profile', apiLimiter, verifyJWT, getProfile);

// 401 si no hay token, 403 si no es admin
router.get('/admin', apiLimiter, verifyJWT, requireRole('admin'), getAdmin);

export { router };
