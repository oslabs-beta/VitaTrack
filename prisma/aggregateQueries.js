const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ==================== DAILY FOOD STATS ====================

// Get daily nutrition totals for a user
async function getDailyNutritionStats(userId, date) {
  const stats = await prisma.foodLog.aggregate({
    where: {
      userId,
      loggedDate: date
    },
    _sum: {
      calories: true,
      protein: true,
      carbs: true,
      fat: true,
      fiber: true,
      sugar: true
    },
    _count: {
      id: true // number of food entries
    }
  })

  return {
    totalCalories: stats._sum.calories || 0,
    totalProtein: stats._sum.protein || 0,
    totalCarbs: stats._sum.carbs || 0,
    totalFat: stats._sum.fat || 0,
    totalFiber: stats._sum.fiber || 0,
    totalSugar: stats._sum.sugar || 0,
    mealCount: stats._count.id,
    date: date
  }
}

// Get daily nutrition breakdown by meal type
async function getDailyMealBreakdown(userId, date) {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
  const breakdown = {}

  for (const mealType of mealTypes) {
    const stats = await prisma.foodLog.aggregate({
      where: {
        userId,
        loggedDate: date,
        mealType
      },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fat: true
      }
    })

    breakdown[mealType] = {
      calories: stats._sum.calories || 0,
      protein: stats._sum.protein || 0,
      carbs: stats._sum.carbs || 0,
      fat: stats._sum.fat || 0
    }
  }

  return breakdown
}

// Get nutrition trends over date range
async function getNutritionTrends(userId, startDate, endDate) {
  const dailyStats = await prisma.$queryRaw`
    SELECT 
      logged_date as date,
      SUM(calories) as total_calories,
      SUM(protein) as total_protein,
      SUM(carbohydrates) as total_carbs,
      SUM(fat) as total_fat,
      COUNT(*) as meal_count
    FROM food_logs 
    WHERE user_id = ${userId} 
      AND logged_date >= ${startDate} 
      AND logged_date <= ${endDate}
    GROUP BY logged_date 
    ORDER BY logged_date ASC
  `

  return dailyStats.map(day => ({
    date: day.date,
    totalCalories: Number(day.total_calories) || 0,
    totalProtein: Number(day.total_protein) || 0,
    totalCarbs: Number(day.total_carbs) || 0,
    totalFat: Number(day.total_fat) || 0,
    mealCount: Number(day.meal_count) || 0
  }))
}

// ==================== WEEKLY WORKOUT STATS ====================

// Get weekly workout summary
async function getWeeklyWorkoutStats(userId, startDate, endDate) {
  const stats = await prisma.workout.aggregate({
    where: {
      userId,
      workoutDate: {
        gte: startDate,
        lte: endDate
      }
    },
    _sum: {
      duration: true,
      distance: true,
      caloriesBurned: true
    },
    _count: {
      id: true
    },
    _avg: {
      duration: true
    }
  })

  // Get workout type breakdown
  const typeBreakdown = await prisma.workout.groupBy({
    by: ['workoutType'],
    where: {
      userId,
      workoutDate: {
        gte: startDate,
        lte: endDate
      }
    },
    _count: {
      workoutType: true
    },
    _sum: {
      duration: true
    }
  })

  return {
    totalWorkouts: stats._count.id,
    totalDuration: stats._sum.duration || 0,
    totalDistance: stats._sum.distance || 0,
    totalCaloriesBurned: stats._sum.caloriesBurned || 0,
    averageDuration: Math.round(stats._avg.duration || 0),
    workoutTypeBreakdown: typeBreakdown.map(type => ({
      type: type.workoutType,
      count: type._count.workoutType,
      totalDuration: type._sum.duration || 0
    })),
    weekStart: startDate,
    weekEnd: endDate
  }
}

// Get workout trends over time
async function getWorkoutTrends(userId, startDate, endDate) {
  const weeklyStats = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('week', workout_date) as week_start,
      COUNT(*) as workout_count,
      SUM(duration) as total_duration,
      SUM(calories_burned) as total_calories,
      AVG(duration) as avg_duration
    FROM workouts 
    WHERE user_id = ${userId} 
      AND workout_date >= ${startDate} 
      AND workout_date <= ${endDate}
    GROUP BY DATE_TRUNC('week', workout_date)
    ORDER BY week_start ASC
  `

  return weeklyStats.map(week => ({
    weekStart: week.week_start,
    workoutCount: Number(week.workout_count) || 0,
    totalDuration: Number(week.total_duration) || 0,
    totalCalories: Number(week.total_calories) || 0,
    avgDuration: Math.round(Number(week.avg_duration) || 0)
  }))
}

// ==================== GOAL PROGRESS STATS ====================

// Calculate goal progress percentage
async function getGoalProgress(userId, goalId) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { user: true }
  })

  if (!goal || goal.userId !== userId) {
    throw new Error('Goal not found')
  }

  const progressPercent = goal.targetValue > 0 
    ? Math.round((goal.currentValue / goal.targetValue) * 100)
    : 0

  return {
    ...goal,
    progressPercent,
    isCompleted: progressPercent >= 100,
    remaining: Math.max(0, goal.targetValue - goal.currentValue)
  }
}

// Get all goals with progress for user
async function getAllGoalsWithProgress(userId) {
  const goals = await prisma.goal.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' }
  })

  return Promise.all(goals.map(async (goal) => {
    const progressPercent = goal.targetValue > 0 
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : 0

    return {
      ...goal,
      progressPercent,
      isCompleted: progressPercent >= 100,
      remaining: Math.max(0, goal.targetValue - goal.currentValue)
    }
  }))
}

// ==================== DASHBOARD SUMMARY ====================

// Get complete dashboard data for a user
async function getDashboardSummary(userId, date) {
  const today = date || new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay()) // Start of week

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6) // End of week

  const [
    dailyNutrition,
    dailyMealBreakdown,
    weeklyWorkouts,
    goalsWithProgress
  ] = await Promise.all([
    getDailyNutritionStats(userId, today),
    getDailyMealBreakdown(userId, today),
    getWeeklyWorkoutStats(userId, weekStart, weekEnd),
    getAllGoalsWithProgress(userId)
  ])

  return {
    date: today,
    nutrition: {
      daily: dailyNutrition,
      mealBreakdown: dailyMealBreakdown
    },
    workouts: weeklyWorkouts,
    goals: goalsWithProgress
  }
}

module.exports = {
  // Nutrition stats
  getDailyNutritionStats,
  getDailyMealBreakdown,
  getNutritionTrends,
  
  // Workout stats
  getWeeklyWorkoutStats,
  getWorkoutTrends,
  
  // Goal progress
  getGoalProgress,
  getAllGoalsWithProgress,
  
  // Dashboard
  getDashboardSummary
}