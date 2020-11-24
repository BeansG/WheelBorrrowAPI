const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for review'],
        maxLength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating 1 to 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    }
});

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// static method to get average of rating
ReviewSchema.statics.getAverageRating = async function (productId) {
    const obj = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    try {
        await this.model('Product').findByIdAndUpdate(productId, {
            averageRating: obj[0].averageRating / 10 * 10
        });
    } catch (err) {
        console.error();
    }
}

// Call get average cost after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.product)
});

ReviewSchema.pre('remove', function () {
    this.constructor.getAverageRating(this.product)

});

module.exports = mongoose.model('Review', ReviewSchema);