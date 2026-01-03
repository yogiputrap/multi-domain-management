const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Admin pages
router.get('/dashboard', adminController.dashboard);
router.get('/domains', adminController.domainsPage);
router.get('/users', adminController.usersPage);
router.get('/assignments', adminController.assignmentsPage);
router.get('/subdomains', adminController.subdomainsPage);

module.exports = router;
