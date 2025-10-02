import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Starting seed data creation...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com', 
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith'
    }
  })

  console.log('👥 Created users:', user1.email, user2.email)

  // Create sample food logs
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  await prisma.foodLog.createMany({
    data: [
      // John's meals - today
      {
        userId: user1.id,
        foodName: 'Scrambled Eggs',
        servingSize: 2,
        servingUnit: 'large eggs',
        calories: 180,
        protein: 12,
        carbs: 2,
        fat: 12,
        mealType: 'breakfast',
        loggedDate: today
      },
      {
        userId: user1.id,
        foodName: 'Greek Yogurt',
        servingSize: 1,
        servingUnit: 'cup',
        calories: 150,
        protein: 20,
        carbs: 9,
        fat: 4,
        mealType: 'breakfast',
        loggedDate: today
      },
      {
        userId: user1.id,
        foodName: 'Grilled Chicken Breast',
        servingSize: 6,
        servingUnit: 'oz',
        calories: 280,
        protein: 52,
        carbs: 0,
        fat: 6,
        mealType: 'lunch',
        loggedDate: today
      },
      {
        userId: user1.id,
        foodName: 'Brown Rice',
        servingSize: 1,
        servingUnit: 'cup',
        calories: 220,
        protein: 5,
        carbs: 45,
        fat: 2,
        mealType: 'lunch',
        loggedDate: today
      },
      // Jane's meals - yesterday
      {
        userId: user2.id,
        foodName: 'Oatmeal',
        servingSize: 1,
        servingUnit: 'cup',
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
        mealType: 'breakfast',
        loggedDate: yesterday
      },
      {
        userId: user2.id,
        foodName: 'Banana',
        servingSize: 1,
        servingUnit: 'medium',
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0,
        mealType: 'snack',
        loggedDate: yesterday
      }
    ]
  })

  console.log('🎃 Created food logs')

  // Create sample workouts
  await prisma.workout.createMany({
    data: [
      // John's workouts
      {
        userId: user1.id,
        workoutName: 'Morning Run',
        workoutType: 'cardio',
        duration: 30,
        distance: 3.5,
        intensity: 'moderate',
        caloriesBurned: 350,
        workoutDate: today,
        notes: 'Great pace today!'
      },
      {
        userId: user1.id,
        workoutName: 'Upper Body Strength',
        workoutType: 'strength',
        duration: 45,
        sets: 4,
        reps: 10,
        weight: 135,
        intensity: 'high',
        caloriesBurned: 280,
        workoutDate: yesterday
      },
      // Jane's workouts
      {
        userId: user2.id,
        workoutName: 'Yoga Flow',
        workoutType: 'flexibility',
        duration: 60,
        intensity: 'low',
        caloriesBurned: 180,
        workoutDate: yesterday,
        notes: 'Very relaxing session'
      },
      // Generated workout example
      {
        userId: user2.id,
        workoutName: 'Quick HIIT',
        workoutType: 'cardio',
        duration: 20,
        intensity: 'high',
        caloriesBurned: 220,
        workoutDate: today,
        isGenerated: true
      }
    ]
  })

  console.log('💪 Created workouts')

  // Create sample goals
  await prisma.goal.createMany({
    data: [
      // John's goals
      {
        userId: user1.id,
        goalName: 'Daily Calorie Target',
        goalType: 'calories',
        targetValue: 2200,
        targetUnit: 'calories',
        period: 'daily',
        startDate: today,
        currentValue: 830, // sum of his today's food
        isActive: true
      },
      {
        userId: user1.id,
        goalName: 'Weekly Workout Goal',
        goalType: 'workout_frequency',
        targetValue: 4,
        targetUnit: 'workouts',
        period: 'weekly',
        startDate: today,
        currentValue: 2,
        currentStreak: 2,
        bestStreak: 5,
        isActive: true
      },
      // Jane's goals
      {
        userId: user2.id,
        goalName: 'Weight Loss Target',
        goalType: 'weight',
        targetValue: 140,
        targetUnit: 'lbs',
        period: 'monthly',
        startDate: yesterday,
        currentValue: 150,
        isActive: true
      },
      {
        userId: user2.id,
        goalName: 'Daily Steps',
        goalType: 'habit',
        targetValue: 10000,
        targetUnit: 'steps',
        period: 'daily',
        startDate: yesterday,
        currentValue: 8500,
        currentStreak: 3,
        bestStreak: 12,
        isActive: true
      }
    ]
  })

  console.log('🎯 Created goals')
  console.log('✅ Seed data creation complete!')
}

main()
  .catch((e: Error) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })