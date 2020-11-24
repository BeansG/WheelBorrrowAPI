const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advanced');

// DESC     get all Users
// @route   GET /v1/users
// access   Private / Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// DESC     Get single user
// @route   GET /v1/users/:id
// access   Private / Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({ success: true, data: user });
});

// DESC     Create User
// @route   POST /v1/users
// access   Private / Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({ success: true, data: user });
});

// DESC     Update User
// @route   PUT /v1/users/:id
// access   Private / Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: user });
});

// DESC     Delete User
// @route   DELETE /v1/users/:id
// access   Private / Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User successfully deleted' });
});
