import api from './axios';
import { USE_MOCKS } from '@/config';

export type Goals = {
  dailyCalories?: number;   // target calories per day
  weeklyWorkouts?: number;  // target workouts per week
};

let mockGoals: Goals = { dailyCalories: 2000, weeklyWorkouts: 3 };
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function getGoals(): Promise<Goals> {
  if (USE_MOCKS) {
    await sleep();
    return mockGoals;
  }
  const { data } = await api.get<Goals>('/goals');
  return data;
}

export async function upsertGoals(input: Goals): Promise<Goals> {
  if (USE_MOCKS) {
    await sleep();
    mockGoals = { ...mockGoals, ...input };
    return mockGoals;
  }
  const { data } = await api.post<Goals>('/goals', input);
  return data;
}
