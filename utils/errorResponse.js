class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message);                                 // The error class weare extending has its own message property. We call the class with super and then pass in our same message into it
        this.statusCode = statusCode;
    }
};

module.exports = ErrorResponse;