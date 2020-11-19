const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder.js');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        unique: true,
        required: [true, 'Please provide a product description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    rentalCost: {
        type: String,
        required: [true, 'Please provide a rental cost']
    },
    deposit: {
        type: Number,
        required: [true, 'Please provide the required deposit']
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number must be less than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please provide an address']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        zipcode: String,
        country: String
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be atleast 1'],
        max: [10, 'rating cannot be more than 10']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // user: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
});

// Create slug from name of bootcamp
ProductSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Create geoJSON point
ProductSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    // No need to save the original address in DB
    this.address = undefined;
    next();
});


module.exports = mongoose.model('Product', ProductSchema);