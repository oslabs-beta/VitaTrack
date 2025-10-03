import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getActiveGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal
} from '../prisma/queries.js';
import {
  getGoalProgress,
  getAllGoalsWithProgress
} from '../prisma/aggregateQueries.js';

// GET /api/goals
export async function getUserGoals(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const goals = await getActiveGoals(userId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
}

// GET /api/goals/progress
export async function getAllGoalsProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const goalsWithProgress = await getAllGoalsWithProgress(userId);
    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching goals with progress:', error);
    res.status(500).json({ error: 'Failed to fetch goals progress' });
  }
}

// GET /api/goals/:id/progress
export async function getSingleGoalProgress(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);

    const goalProgress = await getGoalProgress(userId, id.toString());
    res.json(goalProgress);
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    res.status(500).json({ error: 'Failed to fetch goal progress' });
  }
}

// POST /api/goals
export async function createNewGoal(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      goalName,
      goalType,
      targetValue,
      targetUnit,
      period,
      startDate,
      currentValue,
      deadline,
      isActive
    } = req.body;

    // Validation
    if (!goalType || targetValue === undefined || !goalName || !targetUnit || !period || !startDate) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const newGoal = await createGoal({
      userId,
      goalName,
      goalType,
      targetValue,
      targetUnit,
      period,
      startDate: new Date(startDate),
      currentValue,
      deadline: deadline ? new Date(deadline) : undefined,
      isActive
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
}

// PATCH /api/goals/:id/progress
export async function updateGoalProgressValue(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { currentValue, currentStreak } = req.body;

    if (currentValue === undefined) {
      return res.status(400).json({ 
        error: 'Missing required field: currentValue' 
      });
    }

    const updatedGoal = await updateGoalProgress(
      id,
      currentValue,
      currentStreak !== undefined ? currentStreak : null
    );

    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
}

// DELETE /api/goals/:id
export async function deleteGoalEntry(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);

    await deleteGoal(id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
}