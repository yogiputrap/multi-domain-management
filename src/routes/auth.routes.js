const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { redirectIfAuthenticated } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', redirectIfAuthenticated, authController.landingPage);
router.get('/login', redirectIfAuthenticated, authController.loginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;
