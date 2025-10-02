import express from 'express';
import {
  getWorkouts,
  createWorkoutEntry,
  updateWorkoutEntry,
  deleteWorkoutEntry,
  getWeeklyStats,
  getWorkoutTrendsData
} from '../controllers/workoutController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD operations
router.get('/', getWorkouts);
router.post('/', createWorkoutEntry);
router.put('/:id', updateWorkoutEntry);
router.delete('/:id', deleteWorkoutEntry);

// Stats and analytics
router.get('/stats/weekly', getWeeklyStats);
router.get('/trends', getWorkoutTrendsData);

export default router;