import extend from 'extend';
import Speaker from '../models/speaker.server.model';

const getErrorMessage = (err) => {
  let message = '';

  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'Speaker already exists';
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

export function create(req, res) {
  const speaker = new Speaker(req.body);
  speaker.user = req.user;

  speaker.save((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(speaker);
  });
}

export function read(req, res) {
  res.jsonp(req.speaker);
}

export function update(req, res) {
  let { speaker } = req;

  speaker = extend(speaker, req.body);

  speaker.save((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(speaker);
  });
}

export function deletecnj(req, res) {
  const { speaker } = req;

  speaker.remove((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(speaker);
  });
}

export function list(req, res) {
  Speaker.find()
    .sort('-created')
    .populate('user', 'displayName')
    .exec((err, speakers) => {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err),
        });
      }
      res.jsonp(speakers);
    });
}

export function speakerByID(req, res, next, id) {
  Speaker.findById(id)
    .populate('user', 'displayName')
    .exec((err, speaker) => {
      if (err) return next(err);
      if (!speaker) {
        return next(
          new Error(`Failed to load Speaker ${id}`),
        );
      }
      req.speaker = speaker;
      next();
    });
}

export function hasAuthorization(req, res, next) {
  if (req.speaker.user.id !== req.user.id) {
    return res.send(403, 'User is not authorized');
  }
  next();
}
