const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const LoginFailed = require('../errors/LoginFailed');

const ErrorsMessages = require('../utils/ErrorsMessages');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: () => 'Некорректная почта',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    default: 'Ваше имя',
    minlength: 2,
    maxlength: 30,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((document) => {
      if (!document) {
        throw new LoginFailed(ErrorsMessages.NotСorrectInfo);
      }
      return bcrypt.compare(password, document.password)
        .then((matched) => {
          if (!matched) {
            throw new LoginFailed(ErrorsMessages.NotСorrectInfo);
          }
          const user = document.toObject();
          delete user.password;
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
