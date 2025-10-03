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
  const { data } = await api.get<GoalServer[]>('/goals');
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

  const current = await api.get<GoalServer[]>('/goals').then(r => r.data);
  const ops: Promise<any>[] = [];

  const haveDaily = current.find(isDailyCalories);
  if (input.dailyCalories != null && !haveDaily) {
    ops.push(api.post('/goals', {
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

  const haveWeekly = current.find(isWeeklyWorkouts);
  if (input.weeklyWorkouts != null && !haveWeekly) {
    ops.push(api.post('/goals', {
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

  await Promise.all(ops);
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
