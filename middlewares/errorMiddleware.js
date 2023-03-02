const SERVER_ERROR = 500;
const ErrorsMessages = require('../utils/ErrorsMessages');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || SERVER_ERROR;
  const message = statusCode === SERVER_ERROR ? ErrorsMessages.serverError : err.message;
  res.status(err.statusCode).send({ message });
  next();
};
module.exports = errorMiddleware;
