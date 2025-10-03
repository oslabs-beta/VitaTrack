import { Router } from 'express';
import { getNutritionSummary } from '../controllers/nutritionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect with authentication
router.use(authMiddleware);

// POST /api/ai/nutrition/summary
router.post('/nutrition/summary', getNutritionSummary);

export default router;
