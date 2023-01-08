const Movie = require('../models/movie');


const NotFoundError = require('../errors/NotFoundError');
const ErrorCode = require('../errors/ErrorCode');
const ServerError = require('../errors/ServerError');
const OwnershipError = require('../errors/OwnershipError');

const getMovies = ((req, res, next) => {
    Movie.find({ owner: req.user._id })
      .then((movies) => res.send(movies))
      .catch(() => next(new ServerError('Неизвестная ошибка сервера')));
  });

  const createMovies = ((req,res, next) => {
   const { country, director, duration, year, description, image, trailerLink, nameRU, nameEN, thumbnail, movieId } = req.body;
   const owner = req.user._id;
    Movie.create({ owner, country, director, duration, year, description, image, trailerLink, nameRU, nameEN, thumbnail, movieId })
    .then((movie) => res.send(movie))
    .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new ErrorCode('Некорректные данные при создании карточки'));
        } else {
          next(new ServerError('Неизвестная ошибка сервера'));
        }
      });
  });

const deleteMovies = ((req,res, next) => {
    Movie.findById(req.params._id)
    .then((movie) => {
        if (!movie) {
            next(new NotFoundError(`Фильм с указанным '_id=${req.params._id}' не найдена`));
          } else if (movie.owner.toString() !== req.user._id) {
            next(new OwnershipError('Нет доступа'));
          } else {
            movie.remove()
              .then(() => res.send(movie))
              .catch(next);
          }
    })
    .catch((err) => {
        if (err.name === 'CastError') {
          next(new ErrorCode('Некорректные данные'));
        } else {
          next(new ServerError('Неизвестная ошибка сервера'));
        }
      });
})

module.exports = { getMovies, deleteMovies, createMovies }


