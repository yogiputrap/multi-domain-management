const domainService = require('../services/domain.service');
const dnsService = require('../services/dns.service');
const prisma = require('../utils/prisma');
const { validate, subdomainSchema, checkAvailabilitySchema } = require('../utils/validators');

/**
 * User Controller - Handles user panel views and actions
 */
class UserController {
    /**
     * Render user dashboard
     */
    async dashboard(req, res) {
        try {
            const userId = req.user.id;

            // Get user's domains and subdomains
            const [domains, subdomains] = await Promise.all([
                domainService.getUserDomains(userId),
                dnsService.getUserSubdomains(userId)
            ]);

            res.render('user/dashboard', {
                title: 'Dashboard - IFITB MULTIDOMAIN',
                domains,
                subdomains,
                stats: {
                    domainCount: domains.length,
                    subdomainCount: subdomains.length,
                    activeCount: subdomains.filter(s => s.status === 'active').length
                }
            });
        } catch (error) {
            console.error('User dashboard error:', error);
            res.render('user/dashboard', {
                title: 'Dashboard - IFITB MULTIDOMAIN',
                domains: [],
                subdomains: [],
                stats: { domainCount: 0, subdomainCount: 0, activeCount: 0 },
                error: 'Failed to load dashboard data'
            });
        }
    }

    /**
     * Render domain details page
     */
    async domainPage(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check if user has access to this domain
            const assignment = await prisma.domainUser.findFirst({
                where: { domainId: id, userId }
            });

            if (!assignment) {
                return res.redirect('/user/dashboard');
            }

            const domain = await prisma.domain.findUnique({
                where: { id },
                include: {
                    subdomains: {
                        where: { userId },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });

            if (!domain || domain.status !== 'active') {
                return res.redirect('/user/dashboard');
            }

            res.render('user/domain', {
                title: `${domain.rootDomain} - IFITB MULTIDOMAIN`,
                domain,
                subdomains: domain.subdomains
            });
        } catch (error) {
            console.error('Domain page error:', error);
            res.redirect('/user/dashboard');
        }
    }

    /**
     * Render subdomain management page
     */
    async subdomainsPage(req, res) {
        try {
            const userId = req.user.id;
            const domainId = req.query.domain;

            const [domains, subdomains] = await Promise.all([
                domainService.getUserDomains(userId),
                dnsService.getUserSubdomains(userId, domainId)
            ]);

            res.render('user/subdomains', {
                title: 'My Subdomains - IFITB MULTIDOMAIN',
                domains,
                subdomains,
                selectedDomain: domainId,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Subdomains page error:', error);
            res.render('user/subdomains', {
                title: 'My Subdomains - IFITB MULTIDOMAIN',
                domains: [],
                subdomains: [],
                selectedDomain: null,
                error: 'Failed to load subdomains'
            });
        }
    }

    /**
     * Render create subdomain page
     */
    async createSubdomainPage(req, res) {
        try {
            const userId = req.user.id;
            const domains = await domainService.getUserDomains(userId);

            res.render('user/create-subdomain', {
                title: 'Create Subdomain - IFITB MULTIDOMAIN',
                domains,
                success: req.query.success,
                error: req.query.error
            });
        } catch (error) {
            console.error('Create subdomain page error:', error);
            res.render('user/create-subdomain', {
                title: 'Create Subdomain - IFITB MULTIDOMAIN',
                domains: [],
                error: 'Failed to load domains'
            });
        }
    }

    // === API Methods ===

    /**
     * API: Check subdomain availability
     */
    async checkAvailability(req, res) {
        try {
            const validation = validate(checkAvailabilitySchema)(req.body);

            if (!validation.success) {
                // Get the first error message for display
                const firstError = validation.errors[0]?.message || 'Invalid input';

                return res.status(400).json({
                    success: false,
                    available: false,
                    message: firstError,
                    errors: validation.errors
                });
            }

            const { name, domainId } = validation.data;
            const userId = req.user.id;

            // Check if user has access to this domain
            const assignment = await prisma.domainUser.findFirst({
                where: { domainId, userId }
            });

            if (!assignment) {
                return res.status(403).json({
                    success: false,
                    available: false,
                    message: 'You do not have access to this domain',
                    error: 'You do not have access to this domain'
                });
            }

            const result = await dnsService.checkAvailability(name, domainId);

            return res.json({
                success: true,
                ...result
            });
        } catch (error) {
            console.error('Check availability error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to check availability'
            });
        }
    }

    /**
     * API: Create subdomain
     */
    async createSubdomain(req, res) {
        try {
            const validation = validate(subdomainSchema)(req.body);

            if (!validation.success) {
                console.log('[API] Validation failed:', validation.errors);
                console.log('[API] Request body:', req.body);

                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    errors: validation.errors,
                    message: validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')
                });
            }

            const { name, domainId, type, target } = validation.data;
            const userId = req.user.id;

            // Check if user has access to this domain
            const assignment = await prisma.domainUser.findFirst({
                where: { domainId, userId }
            });

            if (!assignment) {
                return res.status(403).json({
                    success: false,
                    error: 'You do not have access to this domain'
                });
            }

            const result = await dnsService.createSubdomain(userId, domainId, name, type, target);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                subdomain: result.subdomain,
                message: result.message || 'Subdomain created successfully'
            });
        } catch (error) {
            console.error('Create subdomain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create subdomain'
            });
        }
    }

    /**
     * API: Update subdomain
     */
    async updateSubdomain(req, res) {
        try {
            const { id } = req.params;
            const { type, target } = req.body;
            const userId = req.user.id;

            // Check ownership
            const subdomain = await prisma.subdomain.findUnique({
                where: { id }
            });

            if (!subdomain || subdomain.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            const result = await dnsService.updateSubdomain(id, type, target);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                subdomain: result.subdomain,
                message: 'Subdomain updated successfully'
            });
        } catch (error) {
            console.error('Update subdomain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update subdomain'
            });
        }
    }

    /**
     * API: Delete subdomain
     */
    async deleteSubdomain(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Check ownership
            const subdomain = await prisma.subdomain.findUnique({
                where: { id }
            });

            if (!subdomain || subdomain.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied'
                });
            }

            const result = await dnsService.deleteSubdomain(id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }

            return res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete subdomain error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete subdomain'
            });
        }
    }

    /**
     * API: Get user's subdomains
     */
    async getSubdomains(req, res) {
        try {
            const userId = req.user.id;
            const { domainId } = req.query;

            const subdomains = await dnsService.getUserSubdomains(userId, domainId);

            return res.json({
                success: true,
                subdomains
            });
        } catch (error) {
            console.error('Get subdomains error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch subdomains'
            });
        }
    }

    /**
     * API: Get user's domains
     */
    async getDomains(req, res) {
        try {
            const userId = req.user.id;
            const domains = await domainService.getUserDomains(userId);

            return res.json({
                success: true,
                domains
            });
        } catch (error) {
            console.error('Get domains error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch domains'
            });
        }
    }
}

module.exports = new UserController();
