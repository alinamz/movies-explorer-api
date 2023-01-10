const Router = require('express');
const auth = require('../middlewares/auth');
const { userBodyValidator, userLoginValidator } = require('../utils/celebrate');
const { login, createUser, logout } = require('../controllers/user');
const userRouter = require('./user');
const movieRouter = require('./movies');

const router = Router();

const NotFoundError = require('../errors/NotFoundError');

const ErrorsMessages = require('../utils/ErrorsMessages');

router.post('/signin', userLoginValidator, login);
router.post('/signup', userBodyValidator, createUser);

router.post('/signout', auth, logout);

router.use('/users', auth, userRouter);
router.use('/movies', auth, movieRouter);

router.all('/*', auth, (req, res, next) => {
  next(new NotFoundError(ErrorsMessages.methodNotFound));
});

module.exports = router;
