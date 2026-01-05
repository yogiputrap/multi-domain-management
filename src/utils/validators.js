const { z } = require('zod');

// User validation schemas
const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['ADMIN', 'USER']).default('USER')
});

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

// Domain validation schemas
const domainSchema = z.object({
    rootDomain: z.string()
        .min(3, 'Domain must be at least 3 characters')
        .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/, 'Invalid domain format'),
    cloudflareApiToken: z.string().optional(),
    cloudflareZoneId: z.string().optional()
});

const domainStatusSchema = z.object({
    status: z.enum(['active', 'disabled'])
});

// Reserved subdomain names - cannot be used by users
const RESERVED_SUBDOMAINS = [
    // System & Infrastructure
    'www', 'mail', 'email', 'smtp', 'pop', 'imap', 'ftp', 'sftp',
    'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'dns', 'dns1', 'dns2',

    // Application
    'api', 'app', 'apps', 'admin', 'administrator', 'panel', 'dashboard',
    'portal', 'console', 'manage', 'management', 'control',

    // Development & Staging
    'dev', 'development', 'staging', 'stage', 'test', 'testing',
    'qa', 'uat', 'sandbox', 'demo', 'beta', 'alpha', 'preview',
    'local', 'localhost',

    // Security & Auth
    'auth', 'login', 'signin', 'signup', 'register', 'sso', 'oauth',
    'secure', 'security', 'ssl', 'cdn', 'assets', 'static',

    // Communication
    'blog', 'news', 'forum', 'support', 'help', 'docs', 'documentation',
    'status', 'health', 'monitor', 'metrics', 'logs',

    // Misc Reserved
    'root', 'system', 'server', 'host', 'hosting', 'web', 'webmail',
    'cpanel', 'whm', 'plesk', 'vpn', 'proxy', 'gateway',
    'backup', 'backups', 'db', 'database', 'mysql', 'postgres',
    'redis', 'cache', 'queue', 'worker', 'cron', 'scheduler'
];

// Subdomain validation schemas
const subdomainSchema = z.object({
    name: z.string()
        .min(1, 'Subdomain name is required')
        .max(63, 'Subdomain name too long')
        .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, 'Invalid subdomain format')
        .refine(
            (name) => !RESERVED_SUBDOMAINS.includes(name.toLowerCase()),
            'This subdomain name is reserved and cannot be used'
        ),
    domainId: z.string().uuid('Invalid domain ID'),
    type: z.enum(['A', 'CNAME']),
    target: z.string().min(1, 'Target is required')
});

const checkAvailabilitySchema = z.object({
    name: z.string()
        .min(1, 'Subdomain name is required')
        .refine(
            (name) => !RESERVED_SUBDOMAINS.includes(name.toLowerCase()),
            'This subdomain name is reserved and cannot be used'
        ),
    domainId: z.string().uuid('Invalid domain ID')
});

// Domain assignment
const assignDomainSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    domainId: z.string().uuid('Invalid domain ID')
});

// Validate function wrapper
const validate = (schema) => (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
        }));
        return { success: false, errors };
    }
    return { success: true, data: result.data };
};

module.exports = {
    RESERVED_SUBDOMAINS,
    registerSchema,
    loginSchema,
    domainSchema,
    domainStatusSchema,
    subdomainSchema,
    checkAvailabilitySchema,
    assignDomainSchema,
    validate
};
