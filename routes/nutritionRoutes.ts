import { Router } from 'express';
import { getNutritionSummary } from '../controllers/nutritionController';

const router = Router();

// POST /api/ai/nutrition/summary
router.post('/ai/nutrition/summary', getNutritionSummary);

export default router;
