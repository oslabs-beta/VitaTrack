import express from 'express';
import {
  getDailyFoodLogs,
  createFoodLogEntry,
  updateFoodLogEntry,
  deleteFoodLogEntry,
  getDailyStats,
  getMealBreakdown,
  getNutritionTrendsData
} from '../controllers/foodLogController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD operations
router.get('/daily/:date', getDailyFoodLogs);
router.post('/', createFoodLogEntry);
router.put('/:id', updateFoodLogEntry);
router.delete('/:id', deleteFoodLogEntry);

// Stats and analytics
router.get('/stats/daily/:date', getDailyStats);
router.get('/stats/meals/:date', getMealBreakdown);
router.get('/trends', getNutritionTrendsData);

export default router;