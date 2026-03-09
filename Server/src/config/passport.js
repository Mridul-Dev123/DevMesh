import userService from '../modules/user/user.service.js';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
passport.use(
  new LocalStrategy(
    { usernameField: 'identifier', passwordField: 'password' },
    async (identifier, password, done) => {
      try {
        const user = await userService.authenticateLocal(identifier, password);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }
        console.log(`|| ${identifier} logged in Successfully`);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getSafeUserById(id);
    if (!user) {
      // Stale session: user was deleted or no longer exists.
      return done(null, false);
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

export default passport;
