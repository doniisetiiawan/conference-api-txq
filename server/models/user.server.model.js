import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

const validateLocalStrategyProperty = function (property) {
  return (
    (this.provider !== 'local' && !this.updated)
    || property.length
  );
};

const validateLocalStrategyPassword = function (password) {
  return (
    this.provider !== 'local'
    || (password && password.length > 6)
  );
};

const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
    validate: [
      validateLocalStrategyProperty,
      'Please fill in your first name',
    ],
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
    validate: [
      validateLocalStrategyProperty,
      'Please fill in your last name',
    ],
  },
  displayName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    default: '',
    validate: [
      validateLocalStrategyProperty,
      'Please fill in your email',
    ],
    match: [
      /.+@.+\..+/,
      'Please fill a valid email address',
    ],
  },
  username: {
    type: String,
    unique: true,
    required: 'Please fill in a username',
    trim: true,
  },
  password: {
    type: String,
    default: '',
    validate: [
      validateLocalStrategyPassword,
      'Password should be longer',
    ],
  },
  salt: {
    type: String,
  },
  provider: {
    type: String,
    required: 'Provider is required',
  },
  providerData: {},
  additionalProvidersData: {},
  roles: {
    type: [
      {
        type: String,
        enum: ['user', 'admin'],
      },
    ],
    default: ['user'],
  },
  updated: {
    type: Date,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre('save', function (next) {
  if (this.password && this.password.length > 6) {
    this.salt = Buffer.from(
      crypto.randomBytes(16).toString('base64'),
      'base64',
    );
    this.password = this.hashPassword(this.password);
  }

  next();
});

UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto
      .pbkdf2Sync(password, this.salt, 10000, 64, 'sha256')
      .toString('base64');
  }
  return password;
};

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.statics.findUniqueUsername = function (
  username,
  suffix,
  callback,
) {
  const _this = this;
  const possibleUsername = username + (suffix || '');

  _this.findOne(
    {
      username: possibleUsername,
    },
    (err, user) => {
      if (!err) {
        if (!user) {
          callback(possibleUsername);
        } else {
          return _this.findUniqueUsername(
            username,
            (suffix || 0) + 1,
            callback,
          );
        }
      } else {
        callback(null);
      }
    },
  );
};

export default mongoose.model('User', UserSchema);
