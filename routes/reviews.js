const express = require('express');
const { getReviews, getReview, addReview, updateReview, deleteReview } = require('../controllers/reviews');
const Review = require('../models/Review');
const advancedResults = require('../middleware/advanced');
const { protect, authorize } = require('../middleware/auth');
const { Router } = require('express');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(
        advancedResults(Review, {
            path: 'product',
            select: 'name desciption'
        }),
        getReviews
    )
    .post(protect, authorize('user', 'admin'), addReview);

router.route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;


