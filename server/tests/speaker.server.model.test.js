import should from 'should';
import mongoose from 'mongoose';
import mocha from 'mocha';

import User from '../models/user.server.model';
import Speaker from '../models/speaker.server.model';
import config from '../config/config';

const {
  describe, it, beforeEach, afterEach,
} = mocha;

let user;
let speaker;

describe('Speaker Model Unit Tests:', () => {
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
      speaker = new Speaker({
        name: 'Speaker Name',
        title: 'Track Title',
        decription: 'description of the speaker track',
        email: 'testemail@test.com.br',
        schedule: '9:10',
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
    it('should be able to save without problems', (done) => speaker.save((err) => {
      should.not.exist(err);
      done();
    }));

    it('should be able to show an error when try to save without name', (done) => {
      speaker.name = '';

      return speaker.save((err) => {
        should.exist(err);
        done();
      });
    });
  });

  afterEach((done) => {
    Speaker.deleteMany().exec();
    User.deleteMany().exec();

    done();
  });
});
