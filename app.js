require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const {
  errors,
} = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const router = require('./routes/index');
const customErrors = require('./middlewares/errors/customErrors');
const allowedCors = require('./utils/allowedCors');

const {
  MONGO_DB_SECRET,
  NODE_ENV,
} = process.env;
const {
  PORT = 3000,
} = process.env;
const {
  requestLogger,
  errorLoger,
} = require('./middlewares/logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

mongoose.connect(NODE_ENV === 'production' ? MONGO_DB_SECRET : 'mongodb://localhost:27017/movies-explorerdb', {
  useNewUrlParser: true,
});

app.use(express.static(path.join(__dirname, 'movies-explorer-api')));

app.use(cors());
app.options('*', cors());

app.use((req, res, next) => {
  const { origin } = req.headers;
  const requestHeaders = req.headers['access-control-request-headers'];

  if (allowedCors.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', requestHeaders);
  }

  const { method } = req;

  const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

  if (method === 'OPTIONS') {
    res.headers('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
    return res.end();
  }

  next();
});

app.use(requestLogger);
app.use(rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(helmet());
app.use(router);
app.use(errorLoger);
app.use(errors());
app.use(customErrors);
app.listen(PORT);
