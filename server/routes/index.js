import express from 'express';
import passport from 'passport';

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect('/');
}

const router = express.Router();

router.get('/', (req, res) => {
  res.send('index.ejs');
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.send({
    user: req.user,
  });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.send({
    message: req.flash('loginMessage'),
  });
});

router.post(
  '/login',
  passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true,
  }),
);

router.get('/signup', (req, res) => {
  res.send({
    message: req.flash('signupMessage'),
  });
});

router.post(
  '/signup',
  passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true,
  }),
);

export default router;
