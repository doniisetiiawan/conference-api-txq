import extend from 'extend';

import Article from '../models/article.server.model';

const getErrorMessage = (err) => {
  let message = '';

  if (err.code) {
    switch (err.code) {
      case 11000:
      case 11001:
        message = 'Article already exists';
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
  const article = new Article(req.body);
  article.user = req.user;

  article.save((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(article);
  });
}

export function read(req, res) {
  res.jsonp(req.article);
}

export function update(req, res) {
  let { article } = req;

  article = extend(article, req.body);

  article.save((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(article);
  });
}

export function deleteksj(req, res) {
  const { article } = req;

  article.remove((err) => {
    if (err) {
      return res.send(400, {
        message: getErrorMessage(err),
      });
    }
    res.jsonp(article);
  });
}

export function list(req, res) {
  Article.find()
    .sort('-created')
    .populate('user', 'displayName')
    .exec((err, articles) => {
      if (err) {
        return res.send(400, {
          message: getErrorMessage(err),
        });
      }
      res.jsonp(articles);
    });
}

export function articleByID(req, res, next, id) {
  Article.findById(id)
    .populate('user', 'displayName')
    .exec((err, article) => {
      if (err) return next(err);
      if (!article) {
        return next(
          new Error(`Failed to load article ${id}`),
        );
      }
      req.article = article;
      next();
    });
}

export function hasAuthorization(req, res, next) {
  if (req.article.user.id !== req.user.id) {
    return res.send(403, {
      message: 'User is not authorized',
    });
  }
  next();
}
