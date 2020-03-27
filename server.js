import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Speaker from './server/models/speaker';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/conference-api-txq', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const router = express.Router();

router.use((req, res, next) => {
  console.log('An action was performed by the server.');
  next();
});

router.get('/', (req, res) => {
  res.json({ message: 'Hello SPA, the API is working!' });
});

router
  .route('/speakers')
  .post((req, res) => {
    const speaker = new Speaker();

    speaker.name = req.body.name;
    speaker.company = req.body.company;
    speaker.title = req.body.title;
    speaker.description = req.body.description;
    speaker.picture = req.body.picture;
    speaker.schedule = req.body.schedule;

    speaker.save((err) => {
      if (err) res.send(err);

      res.json({
        message: 'speaker successfully created!',
      });
    });
  })
  .get((req, res) => {
    Speaker.find((err, speakers) => {
      if (err) res.send(err);

      res.json(speakers);
    });
  });

router
  .route('/speakers/:speaker_id')
  .get((req, res) => {
    Speaker.findById(
      req.params.speaker_id,
      (err, speaker) => {
        if (err) res.send(err);
        res.json(speaker);
      },
    );
  })
  .put((req, res) => {
    Speaker.findById(
      req.params.speaker_id,
      (err, speaker) => {
        if (err) res.send(err);

        speaker.name = req.body.name;
        speaker.company = req.body.company;
        speaker.title = req.body.title;
        speaker.description = req.body.description;
        speaker.picture = req.body.picture;
        speaker.schedule = req.body.schedule;

        speaker.save((err) => {
          if (err) res.send(err);

          res.json({
            message: 'speaker successfully updated!',
          });
        });
      },
    );
  })
  .delete((req, res) => {
    Speaker.deleteOne(
      {
        _id: req.params.speaker_id,
      },
      (err, speaker) => {
        if (err) res.send(err);

        res.json({
          message: 'speaker successfully deleted!',
          speaker,
        });
      },
    );
  });

app.use('/api', router);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
