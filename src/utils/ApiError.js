// src/utils/ApiError.js
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // Can be used to attach extra data if needed
        this.message = message;
        this.success = false;
        this.errors = errors;

        // Maintain stack trace in development
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;