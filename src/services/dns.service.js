const cloudflareService = require('./cloudflare.service');
const mockDnsService = require('./dns.mock.service');
const prisma = require('../utils/prisma');

/**
 * Unified DNS Service
 * Automatically switches between Cloudflare and Mock DNS based on domain configuration
 */
class DNSService {
    /**
     * Create subdomain with automatic provider selection
     * @param {string} userId - User ID
     * @param {string} domainId - Domain ID
     * @param {string} name - Subdomain name
     * @param {string} type - Record type (A or CNAME)
     * @param {string} target - Target IP or domain
     * @returns {Promise<Object>} Result with subdomain data
     */
    async createSubdomain(userId, domainId, name, type, target) {
        try {
            console.log('[DNS] Create subdomain request:', { userId, domainId, name, type, target });

            // Get domain with Cloudflare credentials
            const domain = await prisma.domain.findUnique({
                where: { id: domainId }
            });

            console.log('[DNS] Domain found:', domain ? {
                id: domain.id,
                rootDomain: domain.rootDomain,
                status: domain.status,
                hasCloudflare: !!(domain.cloudflareApiToken && domain.cloudflareZoneId)
            } : 'null');

            if (!domain) {
                return { success: false, error: 'Domain not found' };
            }

            // Check if domain is active
            if (domain.status !== 'active') {
                return { success: false, error: 'Domain is not active' };
            }

            // Check availability
            const existing = await prisma.subdomain.findFirst({
                where: { name, domainId }
            });

            if (existing) {
                console.log('[DNS] Subdomain already exists:', existing.fullDomain);
                return { success: false, error: 'Subdomain already exists' };
            }

            // Determine provider: Cloudflare or Mock
            const useCloudflare = domain.cloudflareApiToken && domain.cloudflareZoneId;
            let dnsResult;
            let cloudflareRecordId = null;
            let status = 'pending';

            if (useCloudflare) {
                console.log(`[DNS] Using Cloudflare for ${name}.${domain.rootDomain}`);

                // Try Cloudflare first
                dnsResult = await cloudflareService.createDNSRecord(domain, name, type, target);

                if (dnsResult.success) {
                    cloudflareRecordId = dnsResult.record.id;
                    status = 'active';
                    console.log(`[DNS] ✅ Cloudflare record created: ${dnsResult.record.id}`);
                } else if (dnsResult.useMock) {
                    // Fallback to database storage if Cloudflare fails
                    console.log(`[DNS] ⚠️ Cloudflare unavailable, using database storage: ${dnsResult.error}`);
                    const mockResult = await mockDnsService.createSubdomain({ userId, domainId, name, type, target });

                    // Mock service already creates the DB record, so we return immediately
                    return {
                        ...mockResult,
                        provider: 'database',
                        message: 'Subdomain created successfully (Cloudflare fallback)'
                    };
                } else {
                    // Cloudflare error without fallback
                    return {
                        success: false,
                        error: dnsResult.error || 'Failed to create DNS record'
                    };
                }
            } else {
                // Use database storage (no external DNS provider)
                console.log(`[DNS] Using database storage for ${name}.${domain.rootDomain}`);
                const mockResult = await mockDnsService.createSubdomain({ userId, domainId, name, type, target });

                // Mock service already creates the DB record, so we return immediately
                return {
                    ...mockResult,
                    provider: 'database'
                };
            }

            // Only reach here if Cloudflare was used successfully
            // Create subdomain record in database with Cloudflare ID
            const subdomain = await prisma.subdomain.create({
                data: {
                    name,
                    fullDomain: `${name}.${domain.rootDomain}`,
                    domainId,
                    userId,
                    type,
                    target,
                    status,
                    cloudflareRecordId
                },
                include: {
                    domain: true,
                    user: { select: { id: true, email: true } }
                }
            });

            return {
                success: true,
                subdomain,
                provider: useCloudflare ? 'cloudflare' : 'database',
                message: useCloudflare
                    ? 'Subdomain created and provisioned via Cloudflare DNS'
                    : 'Subdomain created successfully'
            };

        } catch (error) {
            console.error('[DNS] Create subdomain error:', error);
            console.error('[DNS] Error stack:', error.stack);

            // Provide more specific error messages
            let errorMessage = 'Failed to create subdomain';

            if (error.code === 'P2002') {
                errorMessage = 'Subdomain already exists';
            } else if (error.code === 'P2003') {
                errorMessage = 'Invalid domain or user reference';
            } else if (error.message) {
                errorMessage = error.message;
            }

            return {
                success: false,
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            };
        }
    }

    /**
     * Update subdomain
     * @param {string} id - Subdomain ID
     * @param {string} type - New record type
     * @param {string} target - New target
     * @returns {Promise<Object>} Result
     */
    async updateSubdomain(id, type, target) {
        try {
            const subdomain = await prisma.subdomain.findUnique({
                where: { id },
                include: { domain: true }
            });

            if (!subdomain) {
                return { success: false, error: 'Subdomain not found' };
            }

            const domain = subdomain.domain;
            const useCloudflare = domain.cloudflareApiToken && domain.cloudflareZoneId;

            // Update DNS record
            if (useCloudflare && subdomain.cloudflareRecordId) {
                console.log(`[DNS] Updating Cloudflare record: ${subdomain.cloudflareRecordId}`);

                const dnsResult = await cloudflareService.updateDNSRecord(
                    domain,
                    subdomain.cloudflareRecordId,
                    type,
                    target
                );

                if (!dnsResult.success && !dnsResult.useMock) {
                    return {
                        success: false,
                        error: dnsResult.error || 'Failed to update DNS record'
                    };
                }
            } else {
                // Update in database
                console.log(`[DNS] Updating database record`);
                const mockResult = await mockDnsService.updateSubdomain(id, { type, target });
                if (!mockResult.success) {
                    return mockResult;
                }
            }

            // Update database
            const updated = await prisma.subdomain.update({
                where: { id },
                data: { type, target },
                include: {
                    domain: true,
                    user: { select: { id: true, email: true } }
                }
            });

            return {
                success: true,
                subdomain: updated,
                provider: useCloudflare ? 'cloudflare' : 'mock'
            };

        } catch (error) {
            console.error('Update subdomain error:', error);
            return {
                success: false,
                error: 'Failed to update subdomain'
            };
        }
    }

    /**
     * Delete subdomain
     * @param {string} id - Subdomain ID
     * @returns {Promise<Object>} Result
     */
    async deleteSubdomain(id) {
        try {
            const subdomain = await prisma.subdomain.findUnique({
                where: { id },
                include: { domain: true }
            });

            if (!subdomain) {
                return { success: false, error: 'Subdomain not found' };
            }

            const domain = subdomain.domain;
            const useCloudflare = domain.cloudflareApiToken && domain.cloudflareZoneId;

            // Delete DNS record
            if (useCloudflare && subdomain.cloudflareRecordId) {
                console.log(`[DNS] Deleting Cloudflare record: ${subdomain.cloudflareRecordId}`);

                const dnsResult = await cloudflareService.deleteDNSRecord(
                    domain,
                    subdomain.cloudflareRecordId
                );

                if (!dnsResult.success && !dnsResult.useMock) {
                    console.warn(`[DNS] ⚠️ Cloudflare deletion failed: ${dnsResult.error}`);
                    // Continue with database deletion even if Cloudflare fails
                }
            } else {
                // Delete from database
                console.log(`[DNS] Deleting database record`);
                await mockDnsService.deleteSubdomain(id);
            }

            // Delete from database
            await prisma.subdomain.delete({ where: { id } });

            return {
                success: true,
                provider: useCloudflare ? 'cloudflare' : 'mock'
            };

        } catch (error) {
            console.error('Delete subdomain error:', error);
            return {
                success: false,
                error: 'Failed to delete subdomain'
            };
        }
    }

    /**
     * Check subdomain availability
     * @param {string} name - Subdomain name
     * @param {string} domainId - Domain ID
     * @returns {Promise<Object>} Availability result
     */
    async checkAvailability(name, domainId) {
        return mockDnsService.checkAvailability(name, domainId);
    }

    /**
     * Get user subdomains
     * @param {string} userId - User ID
     * @param {string} domainId - Optional domain filter
     * @returns {Promise<Array>} List of subdomains
     */
    async getUserSubdomains(userId, domainId = null) {
        return mockDnsService.getUserSubdomains(userId, domainId);
    }

    /**
     * Get all subdomains (admin)
     * @returns {Promise<Array>} List of all subdomains
     */
    async getAllSubdomains() {
        return mockDnsService.getAllSubdomains();
    }

    /**
     * Verify Cloudflare credentials for a domain
     * @param {string} apiToken - API token
     * @param {string} zoneId - Zone ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyCloudflareCredentials(apiToken, zoneId) {
        return cloudflareService.verifyCredentials(apiToken, zoneId);
    }
}

module.exports = new DNSService();
