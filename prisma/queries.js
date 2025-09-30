const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ==================== USER QUERIES ====================

// Find user by email (for authentication)
async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

// Create new user (for registration)
async function createUser({ email, passwordHash, firstName, lastName }) {
  return await prisma.user.create({
    data: { email, passwordHash, firstName, lastName }
  })
}

// ==================== FOOD LOG QUERIES ====================

// Get user's food logs for a specific date
async function getFoodLogsByDate(userId, date) {
  return await prisma.foodLog.findMany({
    where: {
      userId,
      loggedDate: date
    },
    orderBy: { createdAt: 'asc' }
  })
}

// Create new food log entry
async function createFoodLog(foodLogData) {
  return await prisma.foodLog.create({
    data: foodLogData
  })
}

// Update food log entry
async function updateFoodLog(id, updateData) {
  return await prisma.foodLog.update({
    where: { id },
    data: updateData
  })
}

// Delete food log entry
async function deleteFoodLog(id) {
  return await prisma.foodLog.delete({
    where: { id }
  })
}

// ==================== WORKOUT QUERIES ====================

// Get user's workouts for a date range
async function getWorkoutsByDateRange(userId, startDate, endDate) {
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

// Create new workout
async function createWorkout(workoutData) {
  return await prisma.workout.create({
    data: workoutData
  })
}

// Update workout
async function updateWorkout(id, updateData) {
  return await prisma.workout.update({
    where: { id },
    data: updateData
  })
}

// Delete workout
async function deleteWorkout(id) {
  return await prisma.workout.delete({
    where: { id }
  })
}

// ==================== GOAL QUERIES ====================

// Get user's active goals
async function getActiveGoals(userId) {
  return await prisma.goal.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Create new goal
async function createGoal(goalData) {
  return await prisma.goal.create({
    data: goalData
  })
}

// Update goal progress
async function updateGoalProgress(id, currentValue, currentStreak = null) {
  const updateData = {
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

// Helper function to get best streak
async function getBestStreak(goalId) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { bestStreak: true }
  })
  return goal?.bestStreak || 0
}

module.exports = {
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

  // Direct prisma access for complex queries
  prisma
}