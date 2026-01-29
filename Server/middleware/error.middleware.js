/**
 * Centralized Error Handling Middleware (OWASP A10:2025)
 * Standardizes error responses and prevents sensitive stack traces from leaking to the client.
 */

const errorHandler = (err, req, res, next) => {
    // Log the full error for server-side debugging
    console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        message = `Resource not found with id of ${err.value}`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message);
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token. Please log in again.';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Your token has expired. Please log in again.';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        message,
        // Only show stack trace in development mode
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

export default errorHandler;
