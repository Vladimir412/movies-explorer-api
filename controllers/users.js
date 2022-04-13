require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET, NODE_ENV } = process.env;

const SOLT = 10;
const ErrorUserNotFound = require('../middlewares/errors/ErrorUserNotFound');
const ErrorUserExists = require('../middlewares/errors/ErrorUserExists');
const ErrorNotCorrectDataForLogin = require('../middlewares/errors/ErrorNotCorrectDataForLogin');
const ErrorNotCorrectData = require('../middlewares/errors/ErrorNotCorrectData');

const getInfoAboutUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new ErrorUserNotFound('Пользователь с таким _id не найден!'));
      }
      return res.send({
        user,
      });
    })
    .catch((err) => next(err));
};

const updateInfoAboutUser = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true,
      runValdators: true,
      upsert: true,
    },
  )
    .then((user) => {
      if (!user) {
        return next(new ErrorUserNotFound('Пользователь с таким _id не найден!'));
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ErrorNotCorrectData('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err.code === 11000) {
        return next(new ErrorUserExists('Переданный email уже используется другим пользователем!'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;
  bcrypt.hash(password, SOLT)
    .then((hash) => User.create({
      email,
      name,
      password: hash,
    }))
    .then((user) => res.send({
      email: user.email,
      name: user.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ErrorNotCorrectData('Переданы некорректные данные _id!'));
      }
      if (err.code === 11000) {
        return next(new ErrorUserExists('Переданный email уже используется другим пользователем!'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  let placeId = null;
  const { email, password } = req.body;
  User.findOne({
     email
    }).select('+password')
    .then((user) => {
      if (!user) {
        return next(new ErrorNotCorrectDataForLogin('Неверный email или пароль!'));
      }
      return bcrypt.compare(password, user.password)
    .then((matched) => {
      if (!matched) {
        return next(new ErrorNotCorrectDataForLogin('Неверный email или пароль!'));
      }
      placeId = user._id.toString();
      const token = jwt.sign(
        { _id: placeId },
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-code',
        { expiresIn: '7d' },
      );
      return token;
    })
    .then(token => {
      if (!token) {
        return next(new ErrorNotCorrectDataForLogin('Неверный email или пароль!'));
      }
      res.send({
         token
      })
    })
  })
    .catch(next)
};

module.exports = {
  getInfoAboutUser,
  updateInfoAboutUser,
  createUser,
  login,
};
