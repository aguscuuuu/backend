import jwt from 'jsonwebtoken';

export const generateToken = (user) =>
    jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const getCookieOptions = () => ({
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
});
