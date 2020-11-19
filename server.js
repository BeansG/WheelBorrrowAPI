const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDb = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config({ path: './config/config.env' });
// Connect to databse
connectDb();
// Initialise express
const app = express();
// Initialise bodyparser
app.use(express.json());

// Bring in routes
const products = require('./routes/products');
// Mount Routes
app.use('/v1/products', products);

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

