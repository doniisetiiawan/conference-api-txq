import express from 'express';

import Speaker from '../models/speaker';

const router = express.Router();

router.get('/', (req, res) => {
  Speaker.find((err, speakers) => {
    if (err) res.send(err);

    res.json(speakers);
  });
});

router.get('/:speaker_id', (req, res) => {
  Speaker.findById(
    req.params.speaker_id,
    (err, speaker) => {
      if (err) res.send(err);
      res.json(speaker);
    },
  );
});

router.post('/', (req, res) => {
  const speaker = new Speaker();

  speaker.name = req.body.name;
  speaker.company = req.body.company;
  speaker.title = req.body.title;
  speaker.description = req.body.description;
  speaker.picture = req.body.picture;
  speaker.schedule = req.body.schedule;

  speaker.save((err) => {
    if (err) res.send(err);

    res.json({ message: 'speaker successfully created!' });
  });
});

router.put('/:speaker_id', (req, res) => {
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
});

router.delete('/:speaker_id', (req, res) => {
  Speaker.deleteOne(
    {
      _id: req.params.speaker_id,
    },
    (err) => {
      if (err) res.send(err);

      res.json({
        message: 'speaker successfully deleted!',
      });
    },
  );
});

export default router;
