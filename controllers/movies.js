require('dotenv').config();
const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;
const Movie = require('../models/movie');
const ErrorNotCorrectData = require('../middlewares/errors/ErrorNotCorrectData');
const ErrorNotFound = require('../middlewares/errors/ErrorNotFound');
const ErrorCantDeleteMovieOtherUsers = require('../middlewares/errors/ErrorCantDeleteMovieOtherUsers');
const ErrorMovieExist = require('../middlewares/errors/ErrorMovieExist');
const jwt = require('jsonwebtoken')

const createMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.findOne({
    movieId,
  })
    .then((movie) => {
      if (movie) {
        return next(new ErrorMovieExist('Фильм с таким movieId уже существует!'));
      }
      return Movie.create({
        country,
        director,
        duration,
        year,
        description,
        image,
        trailer,
        thumbnail,
        owner: req.user._id,
        movieId,
        nameRU,
        nameEN,
      })
        .then((data) => res.send({
          data,
        }));
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ErrorNotCorrectData('Переданы некорректные данные при создании ильма!'));
      }
      return next(err);
    });
};

const getMovies = (req, res, next) => {
  const {authorization} = req.headers
  const token = authorization.replace('Bearer ', '');
  const tokenOwner = jwt.verify(
    token,
    NODE_ENV === 'production' ? JWT_SECRET : 'secret-code',
  )
  Movie.find({owner: tokenOwner._id})
    .then((data) => res.send({
      data,
    }))
    .catch(next);
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        return next(new ErrorNotFound('Фильм с указанным _id не найден!'));
      }
      if (req.user._id !== movie.owner.toString()) {
        return next(new ErrorCantDeleteMovieOtherUsers('Вы не можете удалять фильмы других пользователей!'));
      }
      return Movie.findByIdAndRemove(req.params._id)
        .then(() => res.send({
          message: 'Фильм успешно удалён!',
        }));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ErrorNotCorrectData('Переданы некорректные данные _id!'));
      }
      return next(err);
    });
};

module.exports = {
  createMovies,
  getMovies,
  deleteMovie,
};
