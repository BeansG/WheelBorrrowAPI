const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDb = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');


// Load environment variables
dotenv.config({ path: './config/config.env' });
// Connect to databse
connectDb();
// Initialise express
const app = express();
// Initialise bodyparser
app.use(express.json());
// Initiliase file upload 
app.use(fileUpload());
// Set static folder for image uplaod
app.use(express.static(path.join(__dirname, 'public')));

// Cookie Parser middleware
app.use(cookieParser());
// Sanitize Middleware - protect against SQL injections
app.use(mongoSanitize());
// Helmet middleware - Sets security headers 
app.use(helmet());
// XSS Middleware - Prevent cross site scripting attacks and users inputting any harmful html js etc. in their inputs
app.use(xss());
// HPP Param Pollution Middleware 
app.use(hpp());
// Cross origin Resource Sharing Middleware - Provide connect middleware for CORS (allow for communication with front end on a different domain)
app.use(cors());
// Rate Limiting Middleware - Limit the no. of requests that can be made (relative to time)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});
app.use(limiter);


// Bring in routes
const products = require('./routes/products');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
// Mount Routes
app.use('/v1/products', products);
app.use('/v1/auth', auth);
app.use('/v1/users', users);
app.use('/v1/reviews', reviews);

// Initialise error middleware (must be done after routes mounted)
app.use(errorHandler);

// Dev logger
if (process.env.NODE_ENV = 'development') {
    app.use(morgan('dev'));
};


// Connect server and handle any unhandled promise rejections
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.messsage}`.red);
    // Close server and exit if error
    server.close(() => process.exit(1));
});

