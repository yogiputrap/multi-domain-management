/**
 * Central error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // API error response
    if (req.path.startsWith('/api')) {
        return res.status(statusCode).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // HTML error response
    res.status(statusCode).render('errors/error', {
        title: `Error ${statusCode}`,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

/**
 * Not found handler
 */
const notFoundHandler = (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            error: 'Resource not found'
        });
    }

    res.status(404).render('errors/404', {
        title: 'Page Not Found'
    });
};

/**
 * Async wrapper for route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
