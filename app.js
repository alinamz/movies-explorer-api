const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { PORT = 4000 } = process.env;

const app = express();
const mongoose = require('mongoose');

app.use(cors({
  origin: '*',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}));

mongoose.set({ runValidators: true });

mongoose.connect(config.get('CONNECTION_STRING'), (err) => {
  if (err) throw err;
  console.log('Connected to mongodb');
});
const { errors } = require('celebrate');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorMiddleware = require('./middlewares/errorMiddleware');

app.use(requestLogger);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(router);

app.use(errorLogger);
app.use(errors());

app.use(errorMiddleware);

app.listen(PORT);
