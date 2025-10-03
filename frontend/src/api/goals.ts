import api from './axios';
import { USE_MOCKS } from '@/config';

export type Goals = {
  dailyCalories?: number;
  weeklyWorkouts?: number;
};

type GoalServer = {
  id: number;
  userId: number;
  goalName: string;
  goalType: string;       // 'daily_calories' | 'calories' | 'workout_frequency'
  targetValue: number;
  targetUnit: string;     // 'calories' | 'workouts' | ...
  period: 'daily' | 'weekly' | 'monthly' | string;
  startDate: string;
  endDate?: string | null;
  currentValue?: number;
  progressPercent?: number;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

const todayYMD = () => new Date().toISOString().slice(0, 10);

const isDailyCalories = (g: GoalServer) =>
  (g.goalType === 'daily_calories' || g.goalType === 'calories') && g.period === 'daily';

const isWeeklyWorkouts = (g: GoalServer) =>
  g.goalType === 'workout_frequency' && g.period === 'weekly';

export async function getGoals(): Promise<Goals> {
  if (USE_MOCKS) {
    return { dailyCalories: 2000, weeklyWorkouts: 3 };
  }
  // Active goals
  const { data } = await api.get<GoalServer[]>('/api/goals');
  const res: Goals = {};
  for (const g of data) {
    if (isDailyCalories(g)) res.dailyCalories = g.targetValue;
    if (isWeeklyWorkouts(g)) res.weeklyWorkouts = g.targetValue;
  }
  return res;
}

// Create missing goals (until backend exposes target-update endpoint)
export async function upsertGoals(input: Goals): Promise<Goals> {
  if (USE_MOCKS) return input;

  const current = await api.get<GoalServer[]>('/api/goals').then(r => r.data);
  
  // Find existing goals
  const dailyGoal = current.find(isDailyCalories);
  const weeklyGoal = current.find(isWeeklyWorkouts);

  // Delete if values changed
  const deleteOps: Promise<any>[] = [];
  
  if (dailyGoal && input.dailyCalories != null && dailyGoal.targetValue !== input.dailyCalories) {
    deleteOps.push(api.delete(`/api/goals/${dailyGoal.id}`));
  }
  if (weeklyGoal && input.weeklyWorkouts != null && weeklyGoal.targetValue !== input.weeklyWorkouts) {
    deleteOps.push(api.delete(`/api/goals/${weeklyGoal.id}`));
  }

  if (deleteOps.length > 0) {
    await Promise.all(deleteOps);
    // Small delay to ensure DB processes deletions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Create new goals
  const createOps: Promise<any>[] = [];

  if (input.dailyCalories != null && (!dailyGoal || dailyGoal.targetValue !== input.dailyCalories)) {
    createOps.push(api.post('/api/goals', {
      goalName: 'Daily Calorie Target',
      goalType: 'calories',
      targetValue: input.dailyCalories,
      targetUnit: 'calories',
      period: 'daily',
      startDate: todayYMD(),
      currentValue: 0,
      isActive: true,
    }));
  }

  if (input.weeklyWorkouts != null && (!weeklyGoal || weeklyGoal.targetValue !== input.weeklyWorkouts)) {
    createOps.push(api.post('/api/goals', {
      goalName: 'Weekly Workout Target',
      goalType: 'workout_frequency',
      targetValue: input.weeklyWorkouts,
      targetUnit: 'workouts',
      period: 'weekly',
      startDate: todayYMD(),
      currentValue: 0,
      isActive: true,
    }));
  }

  await Promise.all(createOps);
  
  // Delay before final fetch to ensure DB has processed creates
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return getGoals();
}


// import api from './axios';
// import { USE_MOCKS } from '@/config';

// export type Goals = {
//   dailyCalories?: number;   // target calories per day
//   weeklyWorkouts?: number;  // target workouts per week
// };

// let mockGoals: Goals = { dailyCalories: 2000, weeklyWorkouts: 3 };
// const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// export async function getGoals(): Promise<Goals> {
//   if (USE_MOCKS) {
//     await sleep();
//     return mockGoals;
//   }
//   const { data } = await api.get<Goals>('/goals');
//   return data;
// }

// export async function upsertGoals(input: Goals): Promise<Goals> {
//   if (USE_MOCKS) {
//     await sleep();
//     mockGoals = { ...mockGoals, ...input };
//     return mockGoals;
//   }
//   const { data } = await api.post<Goals>('/goals', input);
//   return data;
// }
