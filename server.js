import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import speakers from './server/routes/speakers';
import config from './server/config/config';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', () => {
  console.error(
    'MongoDB Connection Error. Make sure MongoDB is running.',
  );
});

const router = express.Router();

router.use((req, res, next) => {
  console.log('An action was performed by the server.');
  next();
});

app.use('/api/speakers', speakers);

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
  console.log(
    `Express server listening on port ${
      server.address().port
    }`,
  );
});
