import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const authService = {
    validateToken: async (token) => {
        try {
            const secret = process.env.JWT_SECRET || 'your-secret-key';
            const decoded = jwt.verify(token, secret);
            // Get user from database to ensure they still exist
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
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
                return null;
            }
            return user;
        }
        catch (error) {
            console.error('Token validation error:', error);
            return null;
        }
    }
};
