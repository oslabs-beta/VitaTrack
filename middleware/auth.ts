import { Request, Response, NextFunction } from 'express';
import { User } from '../types/auth.js';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: Omit<User, 'passwordHash'>;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as any;
      
      // Create user object from token
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        createdAt: new Date(decoded.createdAt || Date.now()),
        updatedAt: new Date(decoded.updatedAt || Date.now())
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};