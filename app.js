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

mongoose.connect(NODE_ENV === 'production' ? MONGO_DB_SECRET : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(express.static(path.join(__dirname, 'movies-explorer-api')));

app.use(cors());
app.options('*', cors());
app.use(requestLogger);
app.use(rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));
app.use(helmet());
app.use(router);
app.use(errors());
app.use(errorLoger);
app.use(customErrors);
app.listen(PORT);
