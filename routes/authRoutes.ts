import { Router } from 'express';
import authController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/validate', authController.validateToken);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, authController.getProfile);

export default router;