const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const errorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// DESC     Get All Products
// @route   GET /v1/products
// access   Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find();
    res
        .status(200)
        .json({ success: true, count: products.length, data: products })
});

// DESC     Get product
// @route   GET /v1/products/:id
// access   Public
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with i.d. of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: product });
});

// DESC     Create new product
// @route   POST /v1/products
// access   private
exports.createProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
});

// DESC     Update product
// @route   PUT /v1/products/:id
// access   private
exports.updateProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!product) {
        return next(new ErrorResponse(`Product not found with i.d. of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: product });
});

// DESC     Delete product
// @route   DELETE /v1/products/:id
// access   private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with i.d. of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, message: `Deleted product with id of ${req.params.id}` })
});

