// Global Error Handling Middleware
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
    // _next is required for Express error middleware signature
    // next changed to _next
    err.statusCode = err.status || err.statusCode || 500;
    err.statusText =
        err.statusText || (err.statusCode >= 500 ? 'error' : 'fail'); // 'error' for server errors, 'fail' for client errors
    err.message = err.message || 'An unexpected error occurred.';

    // Log the error, especially for 500-level errors
    if (err.statusCode >= 500) {
        // console.error('GlobalErrorHandler caught an error:', err); // Removed for no-console
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.statusText,
        statusCode: err.statusCode,
        message: err.message,
        // Optionally, include the error stack in development mode
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = globalErrorHandler;
