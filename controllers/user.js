const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const NotFoundError = require('../errors/NotFoundError');
const ErrorCode = require('../errors/ErrorCode');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');
const LoginFailed = require('../errors/LoginFailed');

const getCurrentUser = ((req, res, next) => {
    User.findById(req.user._id)
      .then((user) => {
        if (!user) {
          next(new NotFoundError('Пользователь с указанным _id не найден'));
        } else {
          res.send(user);
        }
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new ErrorCode('Некорректные данные при получении пользователя'));
        } else {
          next(new ServerError('Неизвестная ошибка сервера'));
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
          throw new NotFoundError({ message: 'Пользователь с указанным _id не найден' });
        } else {
          res.send(user);
        }
      })
      .catch((err) => {
        if (err.name === 'CastError' || err.name === 'ValidationError') {
          next(new ErrorCode('Некорректные данные при получении пользователя'));
        } else {
          next(new ServerError('Неизвестная ошибка сервера'));
        }
      });
  });

  const login = ((req, res, next) => {
    const { email, password } = req.body;
    const SALT = config.get('SALT');
    console.log('я тут', SALT)
    return User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, SALT, { expiresIn: '7d' });
        res
          .cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true })
          .send({ token });
      })
      .catch((err) => {
        console.log(err)
        if (err.statusCode === 401) {
          next(new LoginFailed('Ошибка входа'));
        } else {
          next(new ServerError('Неизвестная ошибка сервера'));
        }
      });
  });

  const createUser = ((req,res, next) => {
    bcrypt.hash(req.body.password, 10).then((hash) =>
    User.create({
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
      next(new ErrorCode('Некорректные данные при получении пользователя'));
    } else if (err.code === 11000) {
      next(new ConflictError('Пользователь с такой почтой уже существует.'));
    } else {
      next(new ServerError('Неизвестная ошибка сервера'));
    }
    })
  });

  const logout = ((req, res) => {
    res.clearCookie("jwt");
    res.send({message : "OK"})
  })


  module.exports = { getCurrentUser, updateUser, login, createUser,  logout }