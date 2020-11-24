const Review = require('../models/Review');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// DESC     Get All Reviews
// @route   GET /v1/reviews
// access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.productId) {
        const reviews = await Review.find({ procuct: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {
        res.status(200).json(res.advancedResults);
    }
});


// DESC     Get Single Review
// @route   GET /v1/reviews/:id
// access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'product',
        select: 'name description'
    });
    if (!review) {
        return next(
            new ErrorResponse(`No review found with the id of ${req.params.id}`), 404)
    }
    res.status(200).json({
        success: true,
        data: review
    })
});


// DESC     Add Review
// @route   POST /v1/products/:productid/reviews
// access   Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.product = req.params.productId;
    req.body.user = req.user.id;

    const product = await Product.findById(req.params.productId);
    if (!product) {
        return next(
            new ErrorResponse(`No product found with the id of ${req.params.productId}`), 404)
    }
    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review
    })
});


// DESC     Update Review
// @route   PUT /v1/reviews/:id
// access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`No review found with the id of ${req.params.id}`), 404)
    }

    // Make sure review belongs to user
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`No authorized to update review`), 401)
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: review
    })
});

// DESC     Delete Review
// @route   DELETE /v1/reviews/:id
// access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(
            new ErrorResponse(`No review found with the id of ${req.params.id}`), 404)
    }

    // Make sure review belongs to user
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`Not authorized to update review`), 401)
    }

    await review.remove();

    res.status(200).json({
        success: true,
        message: 'Review successfully deleted'
    })
});