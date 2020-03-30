import should from 'should';
import mocha from 'mocha';
import mongoose from 'mongoose';

import User from '../models/user.server.model';
import Article from '../models/article.server.model';
import config from '../config/config';

const {
  describe, it, beforeEach, afterEach,
} = mocha;

let user;
let article;

describe('Article Model Unit Tests:', () => {
  beforeEach((done) => {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password',
    });

    user.save(() => {
      article = new Article({
        title: 'Article Title',
        content: 'Article Content',
        user,
      });

      mongoose.connect(config.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
      done();
    });
  });

  describe('Method Save', () => {
    it('should be able to save without problems', (done) => article.save((err) => {
      should.not.exist(err);
      done();
    }));

    it('should be able to show an error when try to save without title', (done) => {
      article.title = '';

      return article.save((err) => {
        should.exist(err);
        done();
      });
    });
  });

  afterEach((done) => {
    Article.deleteMany().exec();
    User.deleteMany().exec();
    done();
  });
});
