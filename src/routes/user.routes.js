const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, requireUser } = require('../middlewares/auth.middleware');

// All user routes require authentication
router.use(authenticate);
router.use(requireUser);

// User pages
router.get('/dashboard', userController.dashboard);
router.get('/domains/:id', userController.domainPage);
router.get('/subdomains', userController.subdomainsPage);
router.get('/subdomains/create', userController.createSubdomainPage);

module.exports = router;
