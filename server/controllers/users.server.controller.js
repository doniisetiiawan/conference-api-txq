import extend from 'extend';
import passport from 'passport';
import { intersect } from 'semver-intersect';

import User from '../models/user.server.model';

const getErrorMessage = (err) => {
  let message = '';

  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'Username already exists';
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const errName in err.errors) {
      if (err.errors[errName].message) message = err.errors[errName].message;
    }
  }

  return message;
};

export function signup(req, res) {
  delete req.body.roles;

  const user = new User(req.body);
  // eslint-disable-next-line no-unused-vars
  const message = null;

  user.provider = 'local';
  user.displayName = `${user.firstName} ${user.lastName}`;

  user.save((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    user.password = undefined;
    user.salt = undefined;

    req.login(user, (err) => {
      if (err) {
        res.send(400, err);
      } else {
        res.jsonp(user);
      }
    });
  });
}

export function signin(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      res.send(400, info);
    } else {
      user.password = undefined;
      user.salt = undefined;

      req.login(user, (err) => {
        if (err) {
          res.send(400, err);
        } else {
          res.jsonp(user);
        }
      });
    }
  })(req, res, next);
}

export function update(req, res) {
  let { user } = req;
  // eslint-disable-next-line no-unused-vars
  const message = null;

  delete req.body.roles;

  if (user) {
    user = extend(user, req.body);
    user.updated = Date.now();
    user.displayName = `${user.firstName} ${user.lastName}`;

    user.save((err) => {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err),
        });
      }
      req.login(user, (err) => {
        if (err) {
          res.send(400, err);
        } else {
          res.jsonp(user);
        }
      });
    });
  } else {
    res.send(400, {
      message: 'User is not signed in',
    });
  }
}

// eslint-disable-next-line no-unused-vars
export function changePassword(req, res, next) {
  const passwordDetails = req.body;
  // eslint-disable-next-line no-unused-vars
  const message = null;

  if (req.user) {
    User.findById(req.user.id, (err, user) => {
      if (!err && user) {
        if (
          user.authenticate(passwordDetails.currentPassword)
        ) {
          if (
            passwordDetails.newPassword
            === passwordDetails.verifyPassword
          ) {
            user.password = passwordDetails.newPassword;

            user.save((err) => {
              if (err) {
                return res.send(400, {
                  message: getErrorMessage(err),
                });
              }
              req.login(user, (err) => {
                if (err) {
                  res.send(400, err);
                } else {
                  res.send({
                    message: 'Password changed successfully',
                  });
                }
              });
            });
          } else {
            res.send(400, {
              message: 'Passwords do not match',
            });
          }
        } else {
          res.send(400, {
            message: 'Current password is incorrect',
          });
        }
      } else {
        res.send(400, {
          message: 'User is not found',
        });
      }
    });
  } else {
    res.send(400, {
      message: 'User is not signed in',
    });
  }
}

export function signout(req, res) {
  req.logout();
  res.redirect('/');
}

export function me(req, res) {
  res.jsonp(req.user || null);
}

export function oauthCallback(strategy) {
  return (req, res, next) => {
    passport.authenticate(
      strategy,
      (err, user, redirectURL) => {
        if (err || !user) {
          return res.redirect('/#!/signin');
        }
        req.login(user, (err) => {
          if (err) {
            return res.redirect('/#!/signin');
          }

          return res.redirect(redirectURL || '/');
        });
      },
    )(req, res, next);
  };
}

export function userByID(req, res, next, id) {
  User.findOne({
    _id: id,
  }).exec((err, user) => {
    if (err) return next(err);
    if (!user) return next(new Error(`Failed to load User ${id}`));
    req.profile = user;
    next();
  });
}

export function requiresLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({
      message: 'User is not logged in',
    });
  }

  next();
}

export function hasAuthorization(roles) {
  const _this = this;

  return (req, res, next) => {
    _this.requiresLogin(req, res, () => {
      if (intersect(req.user.roles, roles).length) {
        return next();
      }
      return res.send(403, {
        message: 'User is not authorized',
      });
    });
  };
}

export function saveOAuthUserProfile(
  req,
  providerUserProfile,
  done,
) {
  if (!req.user) {
    const searchMainProviderIdentifierField = `providerData.${providerUserProfile.providerIdentifierField}`;
    const searchAdditionalProviderIdentifierField = `additionalProvidersData.${providerUserProfile.provider}.${providerUserProfile.providerIdentifierField}`;

    const mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[
      searchMainProviderIdentifierField
    ] = providerUserProfile.providerData[
      providerUserProfile.providerIdentifierField
    ];

    const additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[
      searchAdditionalProviderIdentifierField
    ] = providerUserProfile.providerData[
      providerUserProfile.providerIdentifierField
    ];

    const searchQuery = {
      $or: [
        mainProviderSearchQuery,
        additionalProviderSearchQuery,
      ],
    };

    User.findOne(searchQuery, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        const possibleUsername = providerUserProfile.username
          || (providerUserProfile.email
            ? providerUserProfile.email.split('@')[0]
            : '');

        User.findUniqueUsername(
          possibleUsername,
          null,
          (availableUsername) => {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData,
            });

            user.save((err) => done(err, user));
          },
        );
      } else {
        return done(err, user);
      }
    });
  } else {
    const { user } = req;

    if (
      user.provider !== providerUserProfile.provider
      && (!user.additionalProvidersData
        || !user.additionalProvidersData[
          providerUserProfile.provider
        ])
    ) {
      if (!user.additionalProvidersData) user.additionalProvidersData = {};
      user.additionalProvidersData[
        providerUserProfile.provider
      ] = providerUserProfile.providerData;

      user.markModified('additionalProvidersData');

      user.save((err) => done(err, user, '/#!/settings/accounts'));
    } else {
      return done(
        new Error(
          'User is already connected using this provider',
        ),
        user,
      );
    }
  }
}

// eslint-disable-next-line no-unused-vars
export function removeOAuthProvider(req, res, next) {
  const { user } = req;
  const provider = req.param('provider');

  if (user && provider) {
    if (user.additionalProvidersData[provider]) {
      delete user.additionalProvidersData[provider];

      user.markModified('additionalProvidersData');
    }

    user.save((err) => {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err),
        });
      }
      req.login(user, (err) => {
        if (err) {
          res.send(400, err);
        } else {
          res.jsonp(user);
        }
      });
    });
  }
}
