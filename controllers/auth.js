const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// DESC     Register User/Publisher
// @route   POST /v1/auth/register
// access   Public
exports.register = asyncHandler(async (req, res, next) => {
    // Get info from URL
    const { name, email, password, role } = req.body;
    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

// DESC     Login User
// @route   POST /v1/auth/login
// access   Public
exports.login = asyncHandler(async (req, res, next) => {
    // Get info from URL
    const { email, password } = req.body;
    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`, 400));
    }
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse(`Invalid credentials`, 401));
    }
    // Check for corrrect password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse(`Invalid credentials`, 400));
    }
    sendTokenResponse(user, 200, res);
});


// DESC     Update user details (name and email only)
// @route   PUT /v1/auth/:updateDetails
// access   Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate);

    res
        .status(200)
        .json({ success: true, message: "Account details successfully updated" })
});


// DESC     Update user password
// @route   PUT /v1/auth/:updatepassword
// access   Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password is correct
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Inavlid password`, 401));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendTokenResponse(user, 200, res);
});


// DESC     Get logged in User
// @route   PUT /v1/auth/me
// access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res
        .status(200)
        .json({ success: true, data: user })
});

// DESC     forgot password functionality
// @route   POST /v1/auth/forgotpassword
// access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorResponse(`No user with email provided`, 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url for email 
    const resetUrl = `${req.protocol}://${req.get('host')}/v1/auth/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    // Actually try and send the email:
    try {
        await sendEmail({
            email: user.email,
            subject: `Password Reset Token`,
            message
        })
        res.status(200).json({
            success: true,
            data: 'Email Sent'
        });
    } catch (err) {
        console.log(err);
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new ErrorResponse(`No user with that email`, 500));
    }

    res
        .status(200)
        .json({ success: true, data: user })
});

// DESC     Reset Password
// @route   PUT /v1/auth/resetpassword/:resettoken
// access   Private
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    // Get user and ensure toekn isnt expired 
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorResponse(`Invalid token`, 400));
    }
    // Set new password 
    user.password = req.body.password
    // Reset fields back to nothing
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});

// DESC     Logout user
// @route   GET /v1/auth/logout
// access   Private
exports.logOut = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        messsage: 'Successfully logged out'
    })
});


// Get token from model, create a cookie and send a response - http only means it can only be accessed from client side
const sendTokenResponse = (user, statusCode, res) => {
    // Create JWT 
    const token = user.getSignedJwtToken();
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    // So in production we have a secure flag on our cookie (as it will be sent with https)
    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({ success: true, token })
}