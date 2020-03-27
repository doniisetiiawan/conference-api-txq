import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import flash from 'connect-flash';
import passport from 'passport';
import session from 'express-session';
import MongoStoretmo from 'connect-mongo';
import logger from 'morgan';
import cookieParser from 'cookie-parser';

import routes from './server/routes/index';
import speakers from './server/routes/speakers';
import config from './server/config/config';
import passporteta from './server/config/passport';

const MongoStore = MongoStoretmo(session);

const app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Make sure MongoDB is running.',
  );
});

passporteta(passport);

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

app.use('/', routes);
app.use('/api/speakers', speakers);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  console.log(
    `Express server listening on port ${
      server.address().port
    }`,
  );
});
