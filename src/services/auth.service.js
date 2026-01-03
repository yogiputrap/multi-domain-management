const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../utils/prisma');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    }

    async login(email, password) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return { success: false, error: 'Invalid email or password' };
        }

        const token = this.generateToken(user);

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            },
            token
        };
    }

    async createUser(email, password, role = 'USER') {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: 'Email already exists' };
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role
            }
        });

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }

    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            return null;
        }
    }

    async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
    }

    async getAllUsers() {
        return prisma.user.findMany({
            where: { role: 'USER' },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        domainUsers: true,
                        subdomains: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteUser(id) {
        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        if (user.role === 'ADMIN') {
            return { success: false, error: 'Cannot delete admin user' };
        }

        await prisma.user.delete({ where: { id } });
        return { success: true };
    }
}

module.exports = new AuthService();
