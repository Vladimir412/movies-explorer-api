const router = require('express').Router();
const {
  routerGetInfoAboutUser,
  routerUpdateInfoAboutUser,
  routerCreateUser,
  routerLogin,
} = require('./users');
const {
  routerCreateMovies,
  routerGetMovies,
  routerDeleteMovie,
} = require('./movies');
const auth = require('../middlewares/auth');
const ErrorNotFound = require('../middlewares/errors/ErrorNotFound');

router.use(routerCreateUser);
router.use(routerLogin);
router.use(auth);
router.use(routerGetInfoAboutUser);
router.use(routerUpdateInfoAboutUser);
router.use(routerCreateMovies);
router.use(routerGetMovies);
router.use(routerDeleteMovie);
router.all('*', (req, res, next) => next(new ErrorNotFound('Ресурс не найден!')));
router.use((err, req, res, next) => { // Обработка ошибок
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'Произошла ошибка'
        : message,
    });
  next();
});

module.exports = router;
