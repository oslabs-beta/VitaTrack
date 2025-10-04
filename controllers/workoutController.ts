import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getWorkoutsByDateRange,
  createWorkout,
  updateWorkout,
  deleteWorkout
} from '../prisma/queries.js';
import {
  getWeeklyWorkoutStats,
  getWorkoutTrends
} from '../prisma/aggregateQueries.js';

// GET /api/workouts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function getWorkouts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
      });
    }

    const workouts = await getWorkoutsByDateRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
}

// POST /api/workouts
export async function createWorkoutEntry(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      workoutName,
      workoutDate,
      workoutType,
      duration,
      distance,
      caloriesBurned,
      notes,
      aiSummary
    } = req.body;

    // Validation
    if (!workoutDate || !workoutType || !duration) {
      return res.status(400).json({ 
        error: 'Missing required fields: workoutDate, workoutType, duration' 
      });
    }

    const newWorkout = await createWorkout({
      userId,
      workoutName,
      workoutDate: new Date(workoutDate),
      workoutType,
      duration,
      distance,
      caloriesBurned,
      notes,
      aiSummary
    });

    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
}

// PUT /api/workouts/:id
export async function updateWorkoutEntry(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    const updatedWorkout = await updateWorkout(id, updateData);
    res.json(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({ error: 'Failed to update workout' });
  }
}

// DELETE /api/workouts/:id
export async function deleteWorkoutEntry(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);

    await deleteWorkout(id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
}

// GET /api/workouts/stats/weekly?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function getWeeklyStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
      });
    }

    const stats = await getWeeklyWorkoutStats(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(stats);
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    res.status(500).json({ error: 'Failed to fetch weekly workout stats' });
  }
}

// GET /api/workouts/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function getWorkoutTrendsData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
      });
    }

    const trends = await getWorkoutTrends(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(trends);
  } catch (error) {
    console.error('Error fetching workout trends:', error);
    res.status(500).json({ error: 'Failed to fetch workout trends' });
  }
}