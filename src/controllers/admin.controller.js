const authService = require('../services/auth.service');
const domainService = require('../services/domain.service');
const dnsService = require('../services/dns.service');
const prisma = require('../utils/prisma');
const { validate, registerSchema, domainSchema, assignDomainSchema } = require('../utils/validators');

/**
 * Admin Controller - Handles admin panel views and actions
 */
class AdminController {
    /**
     * Render admin dashboard
     */
    async dashboard(req, res) {
        try {
            // Get statistics
            const [userCount, domainCount, subdomainCount, recentSubdomains] = await Promise.all([
                prisma.user.count({ where: { role: 'USER' } }),
                prisma.domain.count(),
                prisma.subdomain.count(),
                prisma.subdomain.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        domain: true,
                        user: { select: { email: true } }
                    }
                })
            ]);

            res.render('admin/dashboard', {
                title: 'Admin Dashboard - IFITB MULTIDOMAIN',
                stats: { userCount, domainCount, subdomainCount },
                recentSubdomains
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.render('admin/dashboard', {
                title: 'Admin Dashboard - IFITB MULTIDOMAIN',
                stats: { userCount: 0, domainCount: 0, subdomainCount: 0 },
                recentSubdomains: [],
                error: 'Failed to load dashboard data'
            });
        }
    }

    /**
     * Render domains management page
     */
    async domainsPage(req, res) {
        try {
            const domains = await domainService.getAllDomains();
            res.render('admin/domains', {
                title: 'Domain Management - IFITB MULTIDOMAIN',
                domains,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Domains page error:', error);
            res.render('admin/domains', {
                title: 'Domain Management - IFITB MULTIDOMAIN',
                domains: [],
                error: 'Failed to load domains'
            });
        }
    }

    /**
     * Render users management page
     */
    async usersPage(req, res) {
        try {
            const users = await authService.getAllUsers();
            const domains = await domainService.getAllDomains();

            res.render('admin/users', {
                title: 'User Management - IFITB MULTIDOMAIN',
                users,
                domains,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Users page error:', error);
            res.render('admin/users', {
                title: 'User Management - IFITB MULTIDOMAIN',
                users: [],
                domains: [],
                error: 'Failed to load users'
            });
        }
    }

    /**
     * Render assignments page
     */
    async assignmentsPage(req, res) {
        try {
            const users = await authService.getAllUsers();
            const domains = await domainService.getAllDomains();

            // Get all assignments
            const assignments = await prisma.domainUser.findMany({
                include: {
                    domain: true,
                    user: { select: { id: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.render('admin/assignments', {
                title: 'Domain Assignments - IFITB MULTIDOMAIN',
                users,
                domains,
                assignments,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Assignments page error:', error);
            res.render('admin/assignments', {
                title: 'Domain Assignments - IFITB MULTIDOMAIN',
                users: [],
                domains: [],
                assignments: [],
                error: 'Failed to load assignments'
            });
        }
    }

    /**
     * Render all subdomains page
     */
    async subdomainsPage(req, res) {
        try {
            const subdomains = await dnsService.getAllSubdomains();
            res.render('admin/subdomains', {
                title: 'All Subdomains - IFITB MULTIDOMAIN',
                subdomains
            });
        } catch (error) {
            console.error('Subdomains page error:', error);
            res.render('admin/subdomains', {
                title: 'All Subdomains - IFITB MULTIDOMAIN',
                subdomains: [],
                error: 'Failed to load subdomains'
            });
        }
    }

    // === API Methods ===

    /**
     * API: Create new domain
     */
    async createDomain(req, res) {
        try {
            const validation = validate(domainSchema)(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }

            const { rootDomain, cloudflareApiToken, cloudflareZoneId } = validation.data;
            const result = await domainService.createDomain(
                rootDomain,
                cloudflareApiToken,
                cloudflareZoneId
            );

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                domain: result.domain,
                message: 'Domain created successfully'
            });
        } catch (error) {
            console.error('Create domain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create domain'
            });
        }
    }

    /**
     * API: Update domain status
     */
    async updateDomainStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'disabled'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status'
                });
            }

            const result = await domainService.updateDomainStatus(id, status);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                domain: result.domain,
                message: 'Domain status updated'
            });
        } catch (error) {
            console.error('Update domain status error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update domain'
            });
        }
    }

    /**
     * API: Delete domain
     */
    async deleteDomain(req, res) {
        try {
            const { id } = req.params;
            const result = await domainService.deleteDomain(id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                message: 'Domain deleted successfully'
            });
        } catch (error) {
            console.error('Delete domain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete domain'
            });
        }
    }

    /**
     * API: Create new user
     */
    async createUser(req, res) {
        try {
            const validation = validate(registerSchema)(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    errors: validation.errors
                });
            }

            const { email, password, role } = validation.data;
            const result = await authService.createUser(email, password, role || 'USER');

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                user: result.user,
                message: 'User created successfully'
            });
        } catch (error) {
            console.error('Create user error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create user'
            });
        }
    }

    /**
     * API: Delete user
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await authService.deleteUser(id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete user'
            });
        }
    }

    /**
     * API: Assign domain to user
     */
    async assignDomain(req, res) {
        try {
            const { userId, domainId } = req.body;

            if (!userId || !domainId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and Domain ID are required'
                });
            }

            const result = await domainService.assignDomainToUser(domainId, userId);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                assignment: result.assignment,
                message: 'Domain assigned successfully'
            });
        } catch (error) {
            console.error('Assign domain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to assign domain'
            });
        }
    }

    /**
     * API: Remove domain from user
     */
    async unassignDomain(req, res) {
        try {
            const { userId, domainId } = req.body;

            if (!userId || !domainId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID and Domain ID are required'
                });
            }

            const result = await domainService.removeDomainFromUser(domainId, userId);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                message: 'Domain assignment removed'
            });
        } catch (error) {
            console.error('Unassign domain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to remove domain assignment'
            });
        }
    }

    /**
     * API: Delete subdomain
     */
    async deleteSubdomain(req, res) {
        try {
            const { id } = req.params;
            const result = await dnsService.deleteSubdomain(id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                message: 'Subdomain deleted successfully'
            });
        } catch (error) {
            console.error('Delete subdomain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete subdomain'
            });
        }
    }
}

module.exports = new AdminController();
