const router = require('express').Router();

const { getMovies, createMovies, deleteMovies } = require('../controllers/movies');
const {  movieBodyValidator, movieIdValidator } = require('../utils/celebrate');

router.get('/', getMovies);
router.post('/', movieBodyValidator, createMovies);
router.delete('/:_id', movieIdValidator,  deleteMovies);

module.exports = router;

