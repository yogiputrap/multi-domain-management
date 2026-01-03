const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller');
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin, requireUser } = require('../middlewares/auth.middleware');

// ============================================
// Public API Routes
// ============================================
router.post('/auth/login', authController.apiLogin);

// ============================================
// Protected API Routes (Requires Authentication)
// ============================================

// Admin API Routes
router.post('/admin/domains', authenticate, requireAdmin, adminController.createDomain);
router.put('/admin/domains/:id/status', authenticate, requireAdmin, adminController.updateDomainStatus);
router.delete('/admin/domains/:id', authenticate, requireAdmin, adminController.deleteDomain);

router.post('/admin/users', authenticate, requireAdmin, adminController.createUser);
router.delete('/admin/users/:id', authenticate, requireAdmin, adminController.deleteUser);

router.post('/admin/assignments', authenticate, requireAdmin, adminController.assignDomain);
router.delete('/admin/assignments', authenticate, requireAdmin, adminController.unassignDomain);

router.delete('/admin/subdomains/:id', authenticate, requireAdmin, adminController.deleteSubdomain);

// User API Routes
router.get('/user/domains', authenticate, requireUser, userController.getDomains);
router.get('/user/subdomains', authenticate, requireUser, userController.getSubdomains);
router.post('/user/subdomains/check', authenticate, requireUser, userController.checkAvailability);
router.post('/user/subdomains', authenticate, requireUser, userController.createSubdomain);
router.put('/user/subdomains/:id', authenticate, requireUser, userController.updateSubdomain);
router.delete('/user/subdomains/:id', authenticate, requireUser, userController.deleteSubdomain);

module.exports = router;
