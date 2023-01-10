const Movie = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const ErrorCode = require('../errors/ErrorCode');
const ServerError = require('../errors/ServerError');
const OwnershipError = require('../errors/OwnershipError');

const ErrorsMessages = require('../utils/ErrorsMessages');

const getMovies = ((req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch(() => next(new ServerError(ErrorsMessages.serverError)));
});

const createMovies = ((req, res, next) => {
  const owner = req.user._id;
  Movie.create({ ...req.body, owner })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ErrorCode(ErrorsMessages.incorrectData));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

const deleteMovies = ((req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        next(new NotFoundError(ErrorsMessages.movieNotFound));
      } else if (movie.owner.toString() !== req.user._id) {
        next(new OwnershipError(ErrorsMessages.serverError));
      } else {
        movie.remove()
          .then(() => res.send(movie))
          .catch(next);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ErrorCode(ErrorsMessages.incorrectData));
      } else {
        next(new ServerError(ErrorsMessages.serverError));
      }
    });
});

module.exports = { getMovies, deleteMovies, createMovies };
