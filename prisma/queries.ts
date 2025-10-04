import { PrismaClient, User, FoodLog, Workout, Goal } from '@prisma/client'

const prisma = new PrismaClient()

// ==================== TYPE DEFINITIONS ====================

interface CreateUserInput {
  email: string
  passwordHash: string
  firstName: string
  lastName: string
}

interface CreateFoodLogInput {
  userId: string
  loggedDate: Date
  mealType: string
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  servingSize: number
  servingUnit: string
  aiSummary?: string
}

interface UpdateFoodLogInput {
  mealType?: string
  foodName?: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  servingSize?: string
}

interface CreateWorkoutInput {
  userId: string
  workoutName: string
  workoutDate: Date
  workoutType: string
  duration: number
  distance?: number
  caloriesBurned?: number
  notes?: string
  aiSummary?: string
}

interface UpdateWorkoutInput {
  workoutType?: string
  workoutDate?: Date
  duration?: number
  distance?: number
  caloriesBurned?: number
  notes?: string
}

interface CreateGoalInput {
  userId: string
  goalName: string
  goalType: string
  targetValue: number
  targetUnit: string
  period: string      
  startDate: Date      
  currentValue?: number
  deadline?: Date
  isActive?: boolean
}

// ==================== USER QUERIES ====================

async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email }
  })
}

async function createUser(userData: CreateUserInput): Promise<User> {
  return await prisma.user.create({
    data: userData
  })
}

// ==================== FOOD LOG QUERIES ====================

async function getFoodLogsByDate(userId: string, date: Date): Promise<FoodLog[]> {
  return await prisma.foodLog.findMany({
    where: {
      userId,
      loggedDate: date
    },
    orderBy: { createdAt: 'asc' }
  })
}

async function createFoodLog(foodLogData: CreateFoodLogInput): Promise<FoodLog> {
  return await prisma.foodLog.create({
    data: foodLogData
  })
}

async function updateFoodLog(id: number, updateData: UpdateFoodLogInput): Promise<FoodLog> {
  return await prisma.foodLog.update({
    where: { id },
    data: updateData
  })
}

async function deleteFoodLog(id: number): Promise<FoodLog> {
  return await prisma.foodLog.delete({
    where: { id }
  })
}

// ==================== WORKOUT QUERIES ====================

async function getWorkoutsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Workout[]> {
  return await prisma.workout.findMany({
    where: {
      userId,
      workoutDate: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { workoutDate: 'desc' }
  })
}

async function createWorkout(workoutData: CreateWorkoutInput): Promise<Workout> {
  return await prisma.workout.create({
    data: workoutData
  })
}

async function updateWorkout(id: number, updateData: UpdateWorkoutInput): Promise<Workout> {
  return await prisma.workout.update({
    where: { id },
    data: updateData
  })
}

async function deleteWorkout(id: number): Promise<Workout> {
  return await prisma.workout.delete({
    where: { id }
  })
}

// ==================== GOAL QUERIES ====================

async function getActiveGoals(userId: string): Promise<Goal[]> {
  return await prisma.goal.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function createGoal(goalData: CreateGoalInput): Promise<Goal> {
  return await prisma.goal.create({
    data: goalData
  })
}

async function updateGoalProgress(
  id: number,
  currentValue: number,
  currentStreak: number | null = null
): Promise<Goal> {
  const updateData: {
    currentValue: number
    lastUpdated: Date
    currentStreak?: number
    bestStreak?: number
  } = {
    currentValue,
    lastUpdated: new Date()
  }

  if (currentStreak !== null) {
    updateData.currentStreak = currentStreak
    updateData.bestStreak = Math.max(currentStreak, await getBestStreak(id))
  }

  return await prisma.goal.update({
    where: { id },
    data: updateData
  })
}

async function getBestStreak(goalId: number): Promise<number> {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { bestStreak: true }
  })
  return goal?.bestStreak || 0
}

async function deleteGoal(id: number): Promise<Goal> {
  return await prisma.goal.delete({
    where: { id }
  })
}

// ==================== EXPORTS ====================

export {
  // Types
  type CreateUserInput,
  type CreateFoodLogInput,
  type UpdateFoodLogInput,
  type CreateWorkoutInput,
  type UpdateWorkoutInput,
  type CreateGoalInput,
  
  // User queries
  findUserByEmail,
  createUser,

  // Food log queries
  getFoodLogsByDate,
  createFoodLog,
  updateFoodLog,
  deleteFoodLog,

  // Workout queries
  getWorkoutsByDateRange,
  createWorkout,
  updateWorkout,
  deleteWorkout,

  // Goal queries
  getActiveGoals,
  createGoal,
  updateGoalProgress,
  deleteGoal,

  // Direct prisma access for complex queries
  prisma
}