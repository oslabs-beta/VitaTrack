import { Router } from 'express';
import { getNutritionSummary } from '../controllers/nutritionController.js';
import { getWorkoutSummary } from '../controllers/fitnessController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect with authentication
router.use(authMiddleware);

// POST /api/ai/nutrition/summary
router.post('/nutrition/summary', getNutritionSummary);
router.post('/workout/summary', getWorkoutSummary);

export default router;