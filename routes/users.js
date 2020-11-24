const express = require('express');
const advancedResults = require('../middleware/advanced');
const { getUser, getUsers, createUser, updateUser, deleteUser } = require('../controllers/users');
const User = require('../models/User');
const { authorize, protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser)
    .get(getUser);

module.exports = router;
