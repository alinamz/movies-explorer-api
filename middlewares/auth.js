const jwt = require('jsonwebtoken');
const config = require('config');

const ErrorsMessages = require('../utils/ErrorsMessages');

const LoginFailed = require('../errors/LoginFailed');

module.exports = (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    const auth = req.headers.authorization;
    token = auth == null ? null : auth.replace(/^Bearer*\s*/i, '');
    if (!token) {
      next(new LoginFailed(ErrorsMessages.loginFailed));
      return;
    }
  }

  let decoded;

  try {
    const SALT = config.get('SALT');
    decoded = jwt.verify(token, SALT);
    req.user = decoded;
    next();
  } catch (err) {
    next(new LoginFailed(ErrorsMessages.loginFailed));
  }
};
