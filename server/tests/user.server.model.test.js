import should from 'should';
import mocha from 'mocha';
import mongoose from 'mongoose';

import User from '../models/user.server.model';
import config from '../config/config';

const {
  describe, it, before, after,
} = mocha;

let user;
let user2;

describe('User Model Unit Tests:', () => {
  before((done) => {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password',
      provider: 'local',
    });
    user2 = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password',
      provider: 'local',
    });

    mongoose.connect(config.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    done();
  });

  describe('Method Save', () => {
    it('should begin with no users', (done) => {
      User.find({}, (err, users) => {
        users.should.have.length(0);
        done();
      });
    });

    it('should be able to save without problems', (done) => {
      user.save(done);
    });

    it('should fail to save an existing user again', (done) => {
      user.save();
      return user2.save((err) => {
        should.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without first name', (done) => {
      user.firstName = '';
      return user.save((err) => {
        should.exist(err);
        done();
      });
    });
  });

  after((done) => {
    User.deleteMany().exec();
    done();
  });
});
