const prisma = require('../utils/prisma');

class DomainService {
    /**
     * Create a new root domain
     */
    async createDomain(rootDomain, cloudflareApiToken = null, cloudflareZoneId = null) {
        const existing = await prisma.domain.findUnique({
            where: { rootDomain: rootDomain.toLowerCase() }
        });

        if (existing) {
            return { success: false, error: 'Domain already exists' };
        }

        const domainData = {
            rootDomain: rootDomain.toLowerCase(),
            status: 'active'
        };

        // Add Cloudflare credentials if provided
        if (cloudflareApiToken) {
            domainData.cloudflareApiToken = cloudflareApiToken;
        }
        if (cloudflareZoneId) {
            domainData.cloudflareZoneId = cloudflareZoneId;
        }

        const domain = await prisma.domain.create({
            data: domainData
        });

        return { success: true, domain };
    }

    /**
     * Get all domains
     */
    async getAllDomains() {
        return prisma.domain.findMany({
            include: {
                _count: {
                    select: {
                        subdomains: true,
                        domainUsers: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get domain by ID
     */
    async getDomainById(id) {
        return prisma.domain.findUnique({
            where: { id },
            include: {
                subdomains: {
                    include: {
                        user: {
                            select: { id: true, email: true }
                        }
                    }
                },
                domainUsers: {
                    include: {
                        user: {
                            select: { id: true, email: true }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update domain status
     */
    async updateDomainStatus(id, status) {
        const domain = await prisma.domain.findUnique({ where: { id } });

        if (!domain) {
            return { success: false, error: 'Domain not found' };
        }

        const updated = await prisma.domain.update({
            where: { id },
            data: { status }
        });

        return { success: true, domain: updated };
    }

    /**
     * Delete domain
     */
    async deleteDomain(id) {
        const domain = await prisma.domain.findUnique({ where: { id } });

        if (!domain) {
            return { success: false, error: 'Domain not found' };
        }

        // Delete cascades to subdomains and domain_users
        await prisma.domain.delete({ where: { id } });

        return { success: true };
    }

    /**
     * Assign domain to user
     */
    async assignDomainToUser(domainId, userId) {
        const domain = await prisma.domain.findUnique({ where: { id: domainId } });
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!domain) {
            return { success: false, error: 'Domain not found' };
        }
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const existing = await prisma.domainUser.findFirst({
            where: { domainId, userId }
        });

        if (existing) {
            return { success: false, error: 'Domain already assigned to this user' };
        }

        const assignment = await prisma.domainUser.create({
            data: { domainId, userId },
            include: {
                domain: true,
                user: { select: { id: true, email: true } }
            }
        });

        return { success: true, assignment };
    }

    /**
     * Remove domain from user
     */
    async removeDomainFromUser(domainId, userId) {
        const assignment = await prisma.domainUser.findFirst({
            where: { domainId, userId }
        });

        if (!assignment) {
            return { success: false, error: 'Assignment not found' };
        }

        await prisma.domainUser.delete({ where: { id: assignment.id } });

        return { success: true };
    }

    /**
     * Get domains assigned to user
     */
    async getUserDomains(userId) {
        const assignments = await prisma.domainUser.findMany({
            where: { userId },
            include: {
                domain: {
                    include: {
                        _count: {
                            select: { subdomains: true }
                        }
                    }
                }
            }
        });

        return assignments.map(a => a.domain).filter(d => d.status === 'active');
    }
}

module.exports = new DomainService();
