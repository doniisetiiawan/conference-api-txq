import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import passport from 'passport';
import session from 'express-session';
import MongoStoretmo from 'connect-mongo';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import helmet from 'helmet';

import routes from './server/routes/core.server.routes';
import speakers from './server/routes/speakers.server.routes';
import articles from './server/routes/articles.server.routes';
import users from './server/routes/users.server.routes';
import config from './server/config/config';
import passporteta from './server/config/passport';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const MongoStore = MongoStoretmo(session);

const app = express();

app.use((req, res, next) => {
  res.locals.url = `${req.protocol}://${req.headers.host}${req.url}`;
  console.log(res.locals.url);
  next();
});

app.use(compress({
  filter(req, res) {
    return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
  },
  level: 9,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
  app.set('view cache', false);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.enable('jsonp callback');

app.use(cookieParser());

app.use(
  session({
    secret: 'multifunctional',
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
      url: config.url,
      collection: 'sessions',
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(helmet());

mongoose.connect(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Make sure MongoDB is running.',
  );
});

passporteta(passport);

users(app);
routes(app);
articles(app);
speakers(app);

app.use((err, req, res, next) => {
  if (!err) return next();

  console.error(err.stack);

  res.status(500).render('500', {
    error: err.stack,
  });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  console.log(
    `Express server listening on port ${
      server.address().port
    }`,
  );
});
