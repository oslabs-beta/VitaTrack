import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const authController = {
    register: async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;
            // Check if user already exists using Prisma
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                res.status(400).json({ error: 'User already exists' });
                return;
            }
            // Hash password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            // Create user using Prisma
            const newUser = await prisma.user.create({
                data: {
                    email,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    passwordHash
                }
            });
            // Generate token
            const token = jwt.sign({
                userId: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            // Return user without password
            const { passwordHash: _, ...userWithoutPassword } = newUser;
            res.status(201).json({
                user: userWithoutPassword,
                token
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            // Find user using Prisma
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            // Check password
            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            // Generate token
            const token = jwt.sign({
                userId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
            // Return user without password
            const { passwordHash: _, ...userWithoutPassword } = user;
            res.status(200).json({
                user: userWithoutPassword,
                token
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    },
    validateToken: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                res.status(401).json({ valid: false, error: 'No token provided' });
                return;
            }
            const token = authHeader.replace('Bearer ', '');
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            jwt.verify(token, secret);
            res.status(200).json({ valid: true });
        }
        catch (error) {
            res.status(401).json({ valid: false, error: 'Invalid token' });
        }
    },
    getProfile: async (req, res) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'User not authenticated' });
                return;
            }
            // Get fresh user data from Prisma
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.status(200).json({ user });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    }
};
export default authController;
