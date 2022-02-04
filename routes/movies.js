const router = require('express').Router();
const {
  celebrate,
  Joi,
} = require('celebrate');
const isUrl = require('validator/lib/isURL');
const auth = require('../middlewares/auth');
const {
  createMovies,
  getMovies,
  deleteMovie,
} = require('../controllers/movies');

const validateLink = (link) => {
  const valid = isUrl(link, {
    require_protocol: true,
  });

  if (valid) {
    return link;
  }
  throw new Error('Невалидный  Url');
};

const routerCreateMovies = router.post('/movies', auth, celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom(validateLink),
    trailer: Joi.string().required(),
    thumbnail: Joi.string().required(),
    movieId: Joi.string().hex().length(24).required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovies);

const routerGetMovies = router.get('/movies', auth, celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
}), getMovies);

const routerDeleteMovie = router.delete('/movies/:_id', auth, celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object().keys({
    _id: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = {
  routerCreateMovies,
  routerGetMovies,
  routerDeleteMovie,
};
