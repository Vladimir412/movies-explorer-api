require('dotenv').config();

const {
  NODE_ENV,
  JWT_SECRET,
} = process.env;
const jwt = require('jsonwebtoken');
const ErrorNotAuthorzation = require('./errors/ErrorNotAuthorization');

module.exports = (req, res, next) => {
  const {
    authorization,
  } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new ErrorNotAuthorzation('Авторизируйтесь!'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'secret-code',
    );
  } catch (err) {
    next(new ErrorNotAuthorzation('Авторизируйтесь!'));
    next(err);
  }
  req.user = payload;
  return next();
};
