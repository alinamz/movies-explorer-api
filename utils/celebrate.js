const { celebrate, Joi } = require('celebrate');

const linkValidator = /^https?:\/\/(www\.)?[a-zA-Z\0-9]+\.[\w\-._~:/?#[\]@!$&'()*+,;=]{2,}#?$/;

const userDescriptionValidator = celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email().required(),
    }),
  });

  const movieBodyValidator = celebrate({
    body: Joi.object().keys({
        country: Joi.string().required(),
        director: Joi.string().required(),
        duration: Joi.number().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().regex(linkValidator).uri({ scheme: ['http', 'https'] }).required(),
        trailerLink: Joi.string().regex(linkValidator).uri({ scheme: ['http', 'https'] }).required(),
        thumbnail: Joi.string().regex(linkValidator).uri({ scheme: ['http', 'https'] }).required(),
        movieId: Joi.string().alphanum().hex().length(24).required(),
        nameRU: Joi.string().required(),
        nameEN: Joi.string().required(),
    }),
  });

  const movieIdValidator = celebrate({
    params: Joi.object({
      _id: Joi.string().hex().length(24).required(),
    }).required(),
  });

  const userLoginValidator = celebrate({
    body: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  });

  const userBodyValidator = celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  });


  module.exports = { userDescriptionValidator, movieBodyValidator, movieIdValidator, userLoginValidator, userBodyValidator }