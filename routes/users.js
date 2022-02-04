const router = require('express').Router();
const isUrl = require('validator/lib/isEmail');
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
  const valid = isUrl(link, {
    require_protocol: true,
  });

  if (valid) {
    return link;
  }
  throw new Error('Невалидный  Url');
};

// const routerGetInfoAboutUser = router.get('/users/me', getInfoAboutUser);
const routerGetInfoAboutUser = router.get('/users/me', auth, celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
}), getInfoAboutUser);

// const routerUpdateInfoAboutUser = router.patch('/users/me', auth, updateInfoAboutUser);
// const routerUpdateInfoAboutUser = router.patch('/users/me', updateInfoAboutUser);
const routerUpdateInfoAboutUser = router.patch('/users/me', auth, celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().custom(validateLink).min(2),
  }),
}), updateInfoAboutUser);

// const routerCreateUser = router.post('/signup', createUser);
const routerCreateUser = router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email({
      minDomainSegments: 2,
      tlds: {
        allow: ['com', 'net', 'ru'],
      },
    }),
    password: Joi.string().min(8),
  }),
}), createUser);

// const routerLogin = router.post('/signin', login);
const routerLogin = router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({
      minDomainSegments: 2,
      tlds: {
        allow: ['com', 'net', 'ru'],
      },
    }),
    password: Joi.string().min(8),
  }),
}), login);

module.exports = {
  routerGetInfoAboutUser,
  routerUpdateInfoAboutUser,
  routerCreateUser,
  routerLogin,
};
