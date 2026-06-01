import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user-model.js';

export const localStrategy = new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await UserModel.findOne({ email: email.toLowerCase() });
            if (!user) return done(null, false, { message: 'Credenciales inválidas' });

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false, { message: 'Credenciales inválidas' });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
);
