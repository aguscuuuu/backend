import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user-model.js';

export const githubStrategy = new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/v1/auth/github/callback',
        scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.noreply.com`;

            let user = await UserModel.findOne({ email });

            if (!user) {
                const nameParts = (profile.displayName || profile.username || '').split(' ');
                const randomPassword = await bcrypt.hash(uuidv4(), 10);

                user = await UserModel.create({
                    first_name: nameParts[0] || profile.username,
                    last_name: nameParts[1] || 'GitHub',
                    email,
                    age: 25,
                    password: randomPassword,
                    role: 'user'
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
);
