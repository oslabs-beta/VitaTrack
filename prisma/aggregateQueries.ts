import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==================== TYPE DEFINITIONS ====================

interface DailyNutritionStats {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  totalFiber: number
  totalSugar: number
  mealCount: number
  date: Date
}

interface MealNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DailyMealBreakdown {
  breakfast: MealNutrition
  lunch: MealNutrition
  dinner: MealNutrition
  snack: MealNutrition
}

interface NutritionTrendDay {
  date: Date
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  mealCount: number
}

interface WorkoutTypeBreakdown {
  type: string
  count: number
  totalDuration: number
}

interface WeeklyWorkoutStats {
  totalWorkouts: number
  totalDuration: number
  totalDistance: number
  totalCaloriesBurned: number
  averageDuration: number
  workoutTypeBreakdown: WorkoutTypeBreakdown[]
  weekStart: Date
  weekEnd: Date
}

interface WorkoutTrendWeek {
  weekStart: Date
  workoutCount: number
  totalDuration: number
  totalCalories: number
  avgDuration: number
}

interface GoalProgress {
  id: string
  userId: string
  goalType: string
  targetValue: number
  currentValue: number
  isActive: boolean
  createdAt: Date
  progressPercent: number
  isCompleted: boolean
  remaining: number
}

interface DashboardSummary {
  date: Date
  nutrition: {
    daily: DailyNutritionStats
    mealBreakdown: DailyMealBreakdown
  }
  workouts: WeeklyWorkoutStats
  goals: GoalProgress[]
}

// ==================== DAILY FOOD STATS ====================

async function getDailyNutritionStats(
  userId: string,
  date: Date
): Promise<DailyNutritionStats> {
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
      id: true
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

async function getDailyMealBreakdown(
  userId: string,
  date: Date
): Promise<DailyMealBreakdown> {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const
  const breakdown: Partial<DailyMealBreakdown> = {}

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

  return breakdown as DailyMealBreakdown
}

async function getNutritionTrends(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<NutritionTrendDay[]> {
  const dailyStats = await prisma.$queryRaw<Array<{
    date: Date
    total_calories: number | null
    total_protein: number | null
    total_carbs: number | null
    total_fat: number | null
    meal_count: number
  }>>`
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

async function getWeeklyWorkoutStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WeeklyWorkoutStats> {
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

async function getWorkoutTrends(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkoutTrendWeek[]> {
  const weeklyStats = await prisma.$queryRaw<Array<{
    week_start: Date
    workout_count: number
    total_duration: number | null
    total_calories: number | null
    avg_duration: number | null
  }>>`
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

async function getGoalProgress(
  userId: string,
  goalId: string
): Promise<GoalProgress> {
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

async function getAllGoalsWithProgress(userId: string): Promise<GoalProgress[]> {
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

async function getDashboardSummary(
  userId: string,
  date?: Date
): Promise<DashboardSummary> {
  const today = date || new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

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

// ==================== EXPORTS ====================

export {
  // Types
  type DailyNutritionStats,
  type MealNutrition,
  type DailyMealBreakdown,
  type NutritionTrendDay,
  type WorkoutTypeBreakdown,
  type WeeklyWorkoutStats,
  type WorkoutTrendWeek,
  type GoalProgress,
  type DashboardSummary,
  
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