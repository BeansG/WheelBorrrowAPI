const express = require('express');
const { register, updateDetails, login, logOut, getMe, forgotPassword, resetPassword, updatePassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/register')
    .post(register);

router.route('/login')
    .post(login);

router.route('/logout')
    .get(logOut);

router.route('/updatedetails')
    .put(protect, updateDetails);

router.route('/me')
    .get(protect, getMe);

router.route('/forgotpassword')
    .post(forgotPassword);

router.route('/resetpassword/:resettoken')
    .put(resetPassword);

router.route('/updatepassword')
    .put(protect, updatePassword);

module.exports = router;