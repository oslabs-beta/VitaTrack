import { Router } from 'express';
import { getNutritionSummary } from '../controllers/nutritionController.js';
import { getWorkoutSummary } from '../controllers/fitnessController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protect all AI routes with authentication
router.use(authMiddleware);

// POST /api/ai/nutrition/summary
router.post('/nutrition/summary', getNutritionSummary);

// POST /api/ai/fitness/summary
router.post('/fitness/summary', getWorkoutSummary);

export default router;
