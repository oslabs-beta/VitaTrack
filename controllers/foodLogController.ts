import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getFoodLogsByDate,
  createFoodLog,
  updateFoodLog,
  deleteFoodLog
} from '../prisma/queries.js';
import {
  getDailyNutritionStats,
  getDailyMealBreakdown,
  getNutritionTrends
} from '../prisma/aggregateQueries.js';

// GET /api/food-logs/daily/:date
export async function getDailyFoodLogs(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const date = new Date(req.params.date);

    const logs = await getFoodLogsByDate(userId, date);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching food logs:', error);
    res.status(500).json({ error: 'Failed to fetch food logs' });
  }
}

// POST /api/food-logs
export async function createFoodLogEntry(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      loggedDate,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      servingSize,
      servingUnit,
      aiSummary
    } = req.body;

    // Validation
    if (!loggedDate || !mealType || !foodName || calories === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: loggedDate, mealType, foodName, calories' 
      });
    }

    const newLog = await createFoodLog({
      userId,
      loggedDate: new Date(loggedDate),
      mealType,
      foodName,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber,
      sugar,
      servingSize,
      servingUnit,
      aiSummary
    });

    res.status(201).json(newLog);
  } catch (error) {
    console.error('Error creating food log:', error);
    res.status(500).json({ error: 'Failed to create food log' });
  }
}

// PATCH /api/food-logs/:id
export async function updateFoodLogEntry(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { regenerateAI, ...updateData } = req.body;

    // If user wants to regenerate AI summary
    if (regenerateAI && updateData.foodName) {
      // Call OpenAI here
      const aiResponse = await fetch('http://localhost:5001/api/ai/nutrition/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: updateData.foodName })
      });
      const { summary } = await aiResponse.json();
      updateData.aiSummary = summary;
    }

    const updatedLog = await updateFoodLog(id, updateData);
    res.json(updatedLog);
  } catch (error) {
    console.error('Error updating food log:', error);
    res.status(500).json({ error: 'Failed to update food log' });
  }
}

// DELETE /api/food-logs/:id
export async function deleteFoodLogEntry(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id);

    await deleteFoodLog(id);
    res.json({ message: 'Food log deleted successfully' });
  } catch (error) {
    console.error('Error deleting food log:', error);
    res.status(500).json({ error: 'Failed to delete food log' });
  }
}

// GET /api/food-logs/stats/daily/:date
export async function getDailyStats(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const date = new Date(req.params.date);

    const stats = await getDailyNutritionStats(userId, date);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily nutrition stats' });
  }
}

// GET /api/food-logs/stats/meals/:date
export async function getMealBreakdown(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const date = new Date(req.params.date);

    const breakdown = await getDailyMealBreakdown(userId, date);
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching meal breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch meal breakdown' });
  }
}

// GET /api/food-logs/trends?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function getNutritionTrendsData(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate, endDate' 
      });
    }

    const trends = await getNutritionTrends(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(trends);
  } catch (error) {
    console.error('Error fetching nutrition trends:', error);
    res.status(500).json({ error: 'Failed to fetch nutrition trends' });
  }
}