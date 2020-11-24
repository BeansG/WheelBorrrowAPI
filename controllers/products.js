const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const path = require('path');

// DESC     Get All Products
// @route   GET /v1/products
// access   Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    // Respond using our advanced results object
    res
        .status(200)
        .json(res.advancedResults)
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
    // Add user to req.body to ensure only product creator can edit product in the future
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: product });
});

// DESC     Update product
// @route   PUT /v1/products/:id
// access   private
exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with i.d. of ${req.params.id}`, 404));
    }
    // Ensure user is creator
    if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this product`, 401));
    };

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

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
    // Ensure user is creator
    if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this product`, 401));
    };
    res.status(200).json({ success: true, message: `Deleted product with id of ${req.params.id}` })
});

// DESC     Get products withiin a radius of your location
// @route   GET /v1/products/radius/:zipcode/:distance
// access   public
exports.getProductsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    // Get lat/long using geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
    // Get radius 
    const radius = distance / 3963;

    const products = await Product.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });

});

// DESC     Upload photo for bootcamp
// @route   PUT /v1/products/:id/photo
// access   private
exports.productPhotoUpload = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with i.d. of ${req.params.id}`, 404));
    }
    // Ensure user is creator
    if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this product`, 401));
    };
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Ensure image in photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Ensure file size isn't too big for nginx
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom file name to ensure nothin is overwritten
    file.name = `photo_${product._id}${path.parse(file.name).ext}`;
    console.log(file.name)

    // Upload field to database
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Issue with file upload`, 500));
        }

        await Product.findByIdAndUpdate(req.params.id, { photo: file.name });
    })

    res.status(200).json({ success: true, message: `Photo uploaded successfully` })
});
