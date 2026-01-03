const prisma = require('../utils/prisma');

/**
 * Mock DNS Service
 * 
 * This service simulates DNS operations without making real API calls.
 * Designed to be easily swapped with a real DNS provider (e.g., Cloudflare)
 * without changing the controller logic.
 * 
 * Interface methods:
 * - checkAvailability(name, domainId)
 * - createSubdomain(data)
 * - updateSubdomain(id, data)
 * - deleteSubdomain(id)
 */

class MockDNSService {
    constructor() {
        this.artificialDelay = { min: 300, max: 500 };
    }

    /**
     * Simulate network delay
     */
    async delay() {
        const ms = Math.floor(
            Math.random() * (this.artificialDelay.max - this.artificialDelay.min) +
            this.artificialDelay.min
        );
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if subdomain is available
     */
    async checkAvailability(name, domainId) {
        await this.delay();

        const existing = await prisma.subdomain.findFirst({
            where: {
                name: name.toLowerCase(),
                domainId
            }
        });

        const domain = await prisma.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            return {
                available: false,
                error: 'Domain not found'
            };
        }

        return {
            available: !existing,
            fullDomain: `${name.toLowerCase()}.${domain.rootDomain}`,
            message: existing ? 'Subdomain already taken' : 'Subdomain is available'
        };
    }

    /**
     * Create a new subdomain (mock DNS record creation)
     */
    async createSubdomain(data) {
        await this.delay();

        const { name, domainId, userId, type, target } = data;

        // Check domain exists and get root domain
        const domain = await prisma.domain.findUnique({
            where: { id: domainId }
        });

        if (!domain) {
            return { success: false, error: 'Domain not found' };
        }

        if (domain.status !== 'active') {
            return { success: false, error: 'Domain is not active' };
        }

        // Check if already exists
        const existing = await prisma.subdomain.findFirst({
            where: {
                name: name.toLowerCase(),
                domainId
            }
        });

        if (existing) {
            return { success: false, error: 'Subdomain already exists' };
        }

        // Simulate DNS record creation (mock success)
        const subdomain = await prisma.subdomain.create({
            data: {
                name: name.toLowerCase(),
                fullDomain: `${name.toLowerCase()}.${domain.rootDomain}`,
                domainId,
                userId,
                type,
                target,
                status: 'active' // Mock: always succeeds
            },
            include: {
                domain: true
            }
        });

        return {
            success: true,
            subdomain,
            message: 'Subdomain created successfully'
        };
    }

    /**
     * Update subdomain target (mock DNS record update)
     */
    async updateSubdomain(id, data) {
        await this.delay();

        const subdomain = await prisma.subdomain.findUnique({
            where: { id }
        });

        if (!subdomain) {
            return { success: false, error: 'Subdomain not found' };
        }

        const updated = await prisma.subdomain.update({
            where: { id },
            data: {
                type: data.type,
                target: data.target
            },
            include: {
                domain: true
            }
        });

        return {
            success: true,
            subdomain: updated,
            message: 'Subdomain updated successfully'
        };
    }

    /**
     * Delete subdomain (mock DNS record deletion)
     */
    async deleteSubdomain(id) {
        await this.delay();

        const subdomain = await prisma.subdomain.findUnique({
            where: { id }
        });

        if (!subdomain) {
            return { success: false, error: 'Subdomain not found' };
        }

        await prisma.subdomain.delete({
            where: { id }
        });

        return {
            success: true,
            message: 'Subdomain deleted successfully'
        };
    }

    /**
     * Get all subdomains for a user
     */
    async getUserSubdomains(userId, domainId = null) {
        const where = { userId };
        if (domainId) {
            where.domainId = domainId;
        }

        return prisma.subdomain.findMany({
            where,
            include: {
                domain: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get all subdomains (admin)
     */
    async getAllSubdomains() {
        return prisma.subdomain.findMany({
            include: {
                domain: true,
                user: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

module.exports = new MockDNSService();
