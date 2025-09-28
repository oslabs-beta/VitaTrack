const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAllTables() {
  try {
    const userCount = await prisma.user.count()
    const foodLogCount = await prisma.foodLog.count()
    const workoutCount = await prisma.workout.count()
    const goalCount = await prisma.goal.count()
    
    console.log(`👥 Users: ${userCount}`)
    console.log(`🍎 Food logs: ${foodLogCount}`)
    console.log(`💪 Workouts: ${workoutCount}`)
    console.log(`🎯 Goals: ${goalCount}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAllTables()