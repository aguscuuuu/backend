import passport from 'passport';
import { localStrategy } from '../strategies/local-strategy.js';
import { githubStrategy } from '../strategies/github-strategy.js';
import { UserModel } from '../models/user-model.js';

passport.use('local', localStrategy);
passport.use('github', githubStrategy);

passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserModel.findById(id).select('-password');
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
