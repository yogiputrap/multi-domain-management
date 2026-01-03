const authService = require('../services/auth.service');
const { validate, loginSchema, registerSchema } = require('../utils/validators');

/**
 * Auth Controller - Handles authentication views and actions
 */
class AuthController {
    /**
     * Render landing page
     */
    async landingPage(req, res) {
        res.render('public/landing', {
            title: 'IFITB MULTIDOMAIN - Subdomain Management Platform'
        });
    }

    /**
     * Render login page
     */
    async loginPage(req, res) {
        res.render('public/login', {
            title: 'Login - IFITB MULTIDOMAIN',
            error: null
        });
    }

    /**
     * Handle login form submission
     */
    async login(req, res) {
        try {
            const validation = validate(loginSchema)(req.body);

            if (!validation.success) {
                return res.render('public/login', {
                    title: 'Login - IFITB MULTIDOMAIN',
                    error: validation.errors[0].message
                });
            }

            const { email, password } = validation.data;
            const result = await authService.login(email, password);

            if (!result.success) {
                return res.render('public/login', {
                    title: 'Login - IFITB MULTIDOMAIN',
                    error: result.error
                });
            }

            // Set HTTP-only cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Redirect based on role
            if (result.user.role === 'ADMIN') {
                return res.redirect('/admin/dashboard');
            }
            return res.redirect('/user/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            return res.render('public/login', {
                title: 'Login - IFITB MULTIDOMAIN',
                error: 'An error occurred. Please try again.'
            });
        }
    }

    /**
     * Handle logout
     */
    async logout(req, res) {
        res.clearCookie('token');
        res.redirect('/');
    }

    /**
     * API: Login
     */
    async apiLogin(req, res) {
        try {
            const validation = validate(loginSchema)(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }

            const { email, password } = validation.data;
            const result = await authService.login(email, password);

            if (!result.success) {
                return res.status(401).json({
                    success: false,
                    error: result.error
                });
            }

            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.json({
                success: true,
                user: result.user,
                redirectUrl: result.user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
            });
        } catch (error) {
            console.error('API Login error:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new AuthController();
