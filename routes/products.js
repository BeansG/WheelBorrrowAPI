const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductsInRadius, productPhotoUpload } = require('../controllers/products');
const advancedResults = require('../middleware/advanced');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Include other routes for forwarding
const reviewRouter = require('./reviews');
// Reroute certain routes elsewhere
router.use('/:productId/reviews', reviewRouter);


router.route('/')
    .get(advancedResults(Product), getProducts)
    .post(protect, authorize('publisher', 'admin'), createProduct)
    ;

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('publisher', 'admin'), updateProduct)
    .delete(protect, authorize('publisher', 'admin'), deleteProduct)
    ;

router.route('/radius/:zipcode/:distance')
    .get(getProductsInRadius);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), productPhotoUpload);

module.exports = router;