const { validate } = require('../utils/validators');

/**
 * Validation middleware factory
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = validate(schema)(req.body);

        if (!result.success) {
            if (req.path.startsWith('/api')) {
                return res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }

            req.flash = result.errors;
            return res.redirect('back');
        }

        req.validatedData = result.data;
        next();
    };
};

module.exports = {
    validateRequest
};
