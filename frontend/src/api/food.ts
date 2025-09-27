import api from './axios';
import { USE_MOCKS } from '@/config';

export type Meal = {
  id: number;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
};

let mockMeals: Meal[] = [];
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function listToday(): Promise<Meal[]> {
  if (USE_MOCKS) {
    await sleep();
    return mockMeals;
  }
  const { data } = await api.get<Meal[]>('/food', { params: { date: 'today' } });
  return data;
}

export async function createMeal(
  input: Omit<Meal, 'id' | 'createdAt'>
): Promise<Meal> {
  if (USE_MOCKS) {
    await sleep();
    const meal: Meal = { id: Date.now(), createdAt: new Date().toISOString(), ...input };
    mockMeals = [meal, ...mockMeals];
    return meal;
  }
  const { data } = await api.post<Meal>('/food', input);
  return data;
}

export async function removeMeal(id: number): Promise<void> {
  if (USE_MOCKS) {
    await sleep();
    mockMeals = mockMeals.filter((m) => m.id !== id);
    return;
  }
  await api.delete(`/food/${id}`);
}


// import api from './axios';
// import { USE_MOCKS } from '@/config';
// export type Meal = { id:number; name:string; calories:number; createdAt:string };

// const mock: Meal[] = [];
// export const listToday = async () => USE_MOCKS ? mock : (await api.get<Meal[]>('/food?date=today')).data;
// export const createMeal = async (m: Omit<Meal,'id'|'createdAt'>) =>
//   USE_MOCKS ? (mock.push({ id: Date.now(), createdAt: new Date().toISOString(), ...m }), mock[mock.length-1])
//             : (await api.post<Meal>('/food', m)).data;
// export const removeMeal = async (id:number) =>
//   USE_MOCKS ? (mock.splice(mock.findIndex(x=>x.id===id),1), undefined)
//             : api.delete(`/food/${id}`);
