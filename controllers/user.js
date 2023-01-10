const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const ErrorCode = require('../errors/ErrorCode');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');
const LoginFailed = require('../errors/LoginFailed');

const ErrorsMessages = require('../utils/ErrorsMessages');

const getCurrentUser = ((req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError(ErrorsMessages.userNotFound));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorCode(ErrorsMessages.incorrectDataUser));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

const updateUser = ((req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(ErrorsMessages.userNotFound);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new ErrorCode(ErrorsMessages.incorrectDataUser));
      } if (err.code === 11000) {
        next(new ConflictError(ErrorsMessages.userConflict));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

const login = ((req, res, next) => {
  const { email, password } = req.body;
  const SALT = config.get('SALT');
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, SALT, { expiresIn: '7d' });
      res
        .cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
        .send({ token });
    })
    .catch((err) => {
      if (err.statusCode === 401) {
        next(new LoginFailed(ErrorsMessages.loginFailed));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

const createUser = ((req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => User.create({
    email: req.body.email,
    password: hash,
    name: req.body.name,
  }))
    .then((document) => {
      const user = document.toObject();
      delete user.password;
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorCode(ErrorsMessages.incorrectDataUser));
      } else if (err.code === 11000) {
        next(new ConflictError(ErrorsMessages.userConflict));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

const logout = ((req, res) => {
  res.clearCookie('jwt');
  res.send({ message: 'OK' });
});

module.exports = {
  getCurrentUser, updateUser, login, createUser, logout,
};
