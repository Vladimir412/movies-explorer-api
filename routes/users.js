const router = require('express').Router();
const isEmail = require('validator/lib/isEmail');
const {
  celebrate,
  Joi,
} = require('celebrate');
const {
  getInfoAboutUser,
  updateInfoAboutUser,
  createUser,
  login,
} = require('../controllers/users');
const auth = require('../middlewares/auth');

const validateLink = (link) => {
  const valid = isEmail(link, {
    require_protocol: true,
  });

  if (valid) {
    return link;
  }
  throw new Error('Невалидный  Email');
};

const routerGetInfoAboutUser = router.get('/users/me', auth, getInfoAboutUser);

const routerUpdateInfoAboutUser = router.patch('/users/me', auth, celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().custom(validateLink).email({
      minDomainSegments: 2,
      tlds: {
        allow: ['com', 'net', 'ru'],
      },
    }),
  }),
}), updateInfoAboutUser);

const routerCreateUser = router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).required(),
    email: Joi.string().required().email({
      minDomainSegments: 2,
      tlds: {
        allow: ['com', 'net', 'ru'],
      },
    }),
    password: Joi.string().min(8).required(),
  }),
}), createUser);

const routerLogin = router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({
      minDomainSegments: 2,
      tlds: {
        allow: ['com', 'net', 'ru'],
      },
    }),
    password: Joi.string().min(8).required(),
  }),
}), login);

module.exports = {
  routerGetInfoAboutUser,
  routerUpdateInfoAboutUser,
  routerCreateUser,
  routerLogin,
};
