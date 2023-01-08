const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();
const mongoose = require('mongoose');

app.use(cors({
  origin: '*',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
}));


mongoose.connect('mongodb://127.0.0.1:27017/bitfilmsdb', (err) => {
  if (err) throw err;
  console.log('Connected to mongodb');
});
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

app.use(requestLogger);

const auth = require('./middlewares/auth');

app.use(cookieParser());
app.use(bodyParser.json());

const { userLoginValidator, userBodyValidator } = require('./utils/celebrate');
const { login, createUser,  logout } = require('./controllers/user');

app.post('/signin', userLoginValidator, login);
app.post('/signup', userBodyValidator, createUser);
app.post('/signout',  logout)

const userRouter = require('./routes/user');
const movieRouter = require('./routes/movies');

app.use('/users', auth, userRouter);
app.use('/movies', auth, movieRouter);

const NotFoundError = require('./errors/NotFoundError');
const SERVER_ERROR = 500;

app.all('/*', (req, res, next) => {
  next(new NotFoundError('Указанный метод не найден'));
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || SERVER_ERROR;
  const message = statusCode === SERVER_ERROR ? 'На сервере произошла ошибка' : err.message;
  res.status(err.statusCode).send({ message });
  next();
});

app.listen(4000);