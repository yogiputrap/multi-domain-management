const authService = require('../services/auth.service');

/**
 * Authenticate user via JWT token in cookies
 */
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            return res.redirect('/login');
        }

        const decoded = authService.verifyToken(token);
        if (!decoded) {
            res.clearCookie('token');
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }
            return res.redirect('/login');
        }

        const user = await authService.getUserById(decoded.id);
        if (!user) {
            res.clearCookie('token');
            if (req.path.startsWith('/api')) {
                return res.status(401).json({ error: 'User not found' });
            }
            return res.redirect('/login');
        }

        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (req.path.startsWith('/api')) {
            return res.status(500).json({ error: 'Authentication error' });
        }
        return res.redirect('/login');
    }
};

/**
 * Check if user has admin role
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        if (req.path.startsWith('/api')) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        return res.redirect('/user/dashboard');
    }
    next();
};

/**
 * Check if user has regular user role
 */
const requireUser = (req, res, next) => {
    if (!req.user) {
        if (req.path.startsWith('/api')) {
            return res.status(403).json({ error: 'Access denied' });
        }
        return res.redirect('/login');
    }
    next();
};

/**
 * Redirect authenticated users away from public pages
 */
const redirectIfAuthenticated = async (req, res, next) => {
    const token = req.cookies?.token;

    if (token) {
        const decoded = authService.verifyToken(token);
        if (decoded) {
            const user = await authService.getUserById(decoded.id);
            if (user) {
                if (user.role === 'ADMIN') {
                    return res.redirect('/admin/dashboard');
                }
                return res.redirect('/user/dashboard');
            }
        }
    }
    next();
};

module.exports = {
    authenticate,
    requireAdmin,
    requireUser,
    redirectIfAuthenticated
};
