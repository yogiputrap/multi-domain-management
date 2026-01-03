const Cloudflare = require('cloudflare');

/**
 * Cloudflare DNS Service
 * Handles real DNS record provisioning via Cloudflare API
 */
class CloudflareService {
    /**
     * Create DNS record in Cloudflare
     * @param {Object} domain - Domain object with cloudflare credentials
     * @param {string} name - Subdomain name
     * @param {string} type - Record type (A or CNAME)
     * @param {string} content - Target IP or domain
     * @returns {Promise<Object>} Result with success status and record data
     */
    async createDNSRecord(domain, name, type, content) {
        try {
            // Check if domain has Cloudflare credentials
            if (!domain.cloudflareApiToken || !domain.cloudflareZoneId) {
                return {
                    success: false,
                    error: 'Cloudflare credentials not configured for this domain',
                    useMock: true
                };
            }

            // Validate credentials format
            if (!this.validateCredentials(domain.cloudflareApiToken, domain.cloudflareZoneId)) {
                return {
                    success: false,
                    error: 'Invalid Cloudflare credentials format',
                    useMock: true
                };
            }

            // Initialize Cloudflare client
            const cf = new Cloudflare({
                apiToken: domain.cloudflareApiToken
            });

            console.log(`[Cloudflare] Initialized client for zone: ${domain.cloudflareZoneId}`);

            // Prepare DNS record data
            const recordData = {
                type: type,
                name: `${name}.${domain.rootDomain}`,
                content: content,
                ttl: 1, // Auto TTL
                proxied: false // Direct DNS, not proxied through Cloudflare
            };

            // Create DNS record
            console.log('[Cloudflare] Creating DNS record with data:', { zone_id: domain.cloudflareZoneId, ...recordData });

            const record = await cf.dns.records.create({
                zone_id: domain.cloudflareZoneId,
                ...recordData
            });

            return {
                success: true,
                record: {
                    id: record.id,
                    name: record.name,
                    type: record.type,
                    content: record.content,
                    proxied: record.proxied,
                    ttl: record.ttl
                },
                provider: 'cloudflare'
            };

        } catch (error) {
            console.error('Cloudflare DNS creation error:', error);

            // Parse Cloudflare API errors
            const errorMessage = this.parseCloudflareError(error);

            return {
                success: false,
                error: errorMessage,
                useMock: true, // Fallback to mock if Cloudflare fails
                details: error.message
            };
        }
    }

    /**
     * Update DNS record in Cloudflare
     * @param {Object} domain - Domain object with cloudflare credentials
     * @param {string} recordId - Cloudflare DNS record ID
     * @param {string} type - Record type (A or CNAME)
     * @param {string} content - New target IP or domain
     * @returns {Promise<Object>} Result with success status
     */
    async updateDNSRecord(domain, recordId, type, content) {
        try {
            if (!domain.cloudflareApiToken || !domain.cloudflareZoneId) {
                return {
                    success: false,
                    error: 'Cloudflare credentials not configured',
                    useMock: true
                };
            }

            const cf = new Cloudflare({
                apiToken: domain.cloudflareApiToken
            });

            console.log(`[Cloudflare] Updating record ${recordId}`);

            const record = await cf.dns.records.edit(recordId, {
                zone_id: domain.cloudflareZoneId,
                type: type,
                content: content,
                name: undefined // Optional, but usually we just update content for existing subdomains
            });

            return {
                success: true,
                record: {
                    id: record.id,
                    type: record.type,
                    content: record.content
                },
                provider: 'cloudflare'
            };

        } catch (error) {
            console.error('Cloudflare DNS update error:', error);
            return {
                success: false,
                error: this.parseCloudflareError(error),
                details: error.message
            };
        }
    }

    /**
     * Delete DNS record from Cloudflare
     * @param {Object} domain - Domain object with cloudflare credentials
     * @param {string} recordId - Cloudflare DNS record ID
     * @returns {Promise<Object>} Result with success status
     */
    async deleteDNSRecord(domain, recordId) {
        try {
            if (!domain.cloudflareApiToken || !domain.cloudflareZoneId) {
                return {
                    success: false,
                    error: 'Cloudflare credentials not configured',
                    useMock: true
                };
            }

            const cf = new Cloudflare({
                apiToken: domain.cloudflareApiToken
            });

            console.log(`[Cloudflare] Deleting record ${recordId}`);

            await cf.dns.records.delete(recordId, {
                zone_id: domain.cloudflareZoneId
            });

            return {
                success: true,
                provider: 'cloudflare'
            };

        } catch (error) {
            console.error('Cloudflare DNS deletion error:', error);
            return {
                success: false,
                error: this.parseCloudflareError(error),
                details: error.message
            };
        }
    }

    /**
     * Verify Cloudflare credentials
     * @param {string} apiToken - Cloudflare API token
     * @param {string} zoneId - Cloudflare zone ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyCredentials(apiToken, zoneId) {
        try {
            const cf = new Cloudflare({ apiToken: apiToken });

            // Try to get zone details to verify credentials
            const zone = await cf.zones.get({ zone_id: zoneId });

            return {
                success: true,
                zone: {
                    id: zone.id,
                    name: zone.name,
                    status: zone.status
                }
            };

        } catch (error) {
            console.error('Cloudflare verification error:', error);
            return {
                success: false,
                error: this.parseCloudflareError(error)
            };
        }
    }

    /**
     * Validate credentials format
     * @param {string} apiToken - API token to validate
     * @param {string} zoneId - Zone ID to validate
     * @returns {boolean} True if format is valid
     */
    validateCredentials(apiToken, zoneId) {
        // Basic format validation
        if (!apiToken || typeof apiToken !== 'string' || apiToken.length < 10) {
            return false;
        }

        if (!zoneId || typeof zoneId !== 'string' || zoneId.length < 10) {
            return false;
        }

        return true;
    }

    /**
     * Parse Cloudflare API errors into user-friendly messages
     * @param {Error} error - Error object from Cloudflare API
     * @returns {string} User-friendly error message
     */
    parseCloudflareError(error) {
        const message = error.message || '';

        // Common Cloudflare error patterns
        if (message.includes('Invalid API Token')) {
            return 'Invalid Cloudflare API Token. Please check your credentials.';
        }

        if (message.includes('zone not found') || message.includes('Zone ID')) {
            return 'Invalid Zone ID. Please verify your Cloudflare Zone ID.';
        }

        if (message.includes('already exists')) {
            return 'DNS record already exists in Cloudflare.';
        }

        if (message.includes('rate limit')) {
            return 'Cloudflare API rate limit exceeded. Please try again later.';
        }

        if (message.includes('authentication')) {
            return 'Cloudflare authentication failed. Please check your API token.';
        }

        if (message.includes('permission')) {
            return 'Insufficient permissions. Please ensure your API token has DNS edit permissions.';
        }

        // Default error message
        return 'Cloudflare API error. Please check your configuration.';
    }

    /**
     * Get DNS records for a zone
     * @param {Object} domain - Domain object with cloudflare credentials
     * @returns {Promise<Object>} List of DNS records
     */
    async listDNSRecords(domain) {
        try {
            if (!domain.cloudflareApiToken || !domain.cloudflareZoneId) {
                return {
                    success: false,
                    error: 'Cloudflare credentials not configured'
                };
            }

            const cf = new Cloudflare({
                apiToken: domain.cloudflareApiToken
            });

            const records = await cf.dns.records.list({
                zone_id: domain.cloudflareZoneId
            });

            return {
                success: true,
                records: records.result || []
            };

        } catch (error) {
            console.error('Cloudflare list records error:', error);
            return {
                success: false,
                error: this.parseCloudflareError(error)
            };
        }
    }
}

module.exports = new CloudflareService();
