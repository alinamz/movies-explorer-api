const router = require('express').Router();

const { getCurrentUser, updateUser } = require('../controllers/user');
const { userDescriptionValidator } = require('../utils/celebrate');

router.get('/me', getCurrentUser);
router.patch('/me', userDescriptionValidator, updateUser);

module.exports = router;
