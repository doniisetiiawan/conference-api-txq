import { Strategy as LocalStrategy } from 'passport-local';

import User from '../models/user.server.model';

export default (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      (username, password, done) => {
        User.findOne(
          {
            username,
          },
          (err, user) => {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false, {
                message: 'Unknown user',
              });
            }
            if (!user.authenticate(password)) {
              return done(null, false, {
                message: 'Invalid password',
              });
            }

            return done(null, user);
          },
        );
      },
    ),
  );
};
