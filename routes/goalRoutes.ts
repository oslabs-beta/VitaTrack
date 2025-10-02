import express from 'express';
import {
  getUserGoals,
  getAllGoalsProgress,
  getSingleGoalProgress,
  createNewGoal,
  updateGoalProgressValue
} from '../controllers/goalController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Goal operations
router.get('/', getUserGoals);
router.get('/progress', getAllGoalsProgress);
router.get('/:id/progress', getSingleGoalProgress);
router.post('/', createNewGoal);
router.patch('/:id/progress', updateGoalProgressValue);

export default router;