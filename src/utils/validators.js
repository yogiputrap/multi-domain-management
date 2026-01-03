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

// Subdomain validation schemas
const subdomainSchema = z.object({
    name: z.string()
        .min(1, 'Subdomain name is required')
        .max(63, 'Subdomain name too long')
        .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, 'Invalid subdomain format'),
    domainId: z.string().uuid('Invalid domain ID'),
    type: z.enum(['A', 'CNAME']),
    target: z.string().min(1, 'Target is required')
});

const checkAvailabilitySchema = z.object({
    name: z.string().min(1, 'Subdomain name is required'),
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
    registerSchema,
    loginSchema,
    domainSchema,
    domainStatusSchema,
    subdomainSchema,
    checkAvailabilitySchema,
    assignDomainSchema,
    validate
};
