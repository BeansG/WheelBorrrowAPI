const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err }                                                                        // Puts all the properties we get from the err passed in and puts them into the variable error
    error.message = err.message;
    // Log the error to console
    console.log(err)

    // Incorrect id error
    if (err.name === 'CastError') {
        const message = `Product not found with i.d. of ${err.value}`;
        error = new Error(message, 404);
    }
    // Duplicate entry
    if (err.code === 11000) {
        const message = 'Duplicate field enetered';
        error = new ErrorResponse(message, 400);
    }
    // Missing fields error 
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    // This is always the response no matter what, and the message and code changes depening on the above errors
    res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;