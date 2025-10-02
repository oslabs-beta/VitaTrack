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

export type NutritionEstimate = {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence?: number;   // optional, for real API
  source?: string;       // optional, for real API
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

/** AI lookup: pre-fill the form with estimated macros */
export async function aiLookup(query: string): Promise<NutritionEstimate> {
  if (!query.trim()) throw new Error('empty query');

  if (USE_MOCKS) {
    await sleep(400);
    // naive, rule-based mock just to make the UI flow feel real
    const q = query.toLowerCase();
    let est: NutritionEstimate = { name: query, calories: 400, protein: 20, carbs: 40, fat: 15 };
    if (q.includes('chicken')) est = { name: query, calories: 450, protein: 35, carbs: 10, fat: 20 };
    if (q.includes('salad'))   est = { name: query, calories: 320, protein: 15, carbs: 18, fat: 20 };
    if (q.includes('oat'))     est = { name: query, calories: 300, protein: 10, carbs: 50, fat: 5 };
    if (q.includes('burger'))  est = { name: query, calories: 650, protein: 30, carbs: 50, fat: 35 };
    return est;
  }

  // Real API: choose GET or POST (agree with backend)
  // GET example:
  const { data } = await api.get<NutritionEstimate>('/food/ai-lookup', { params: { query } });
  // POST example:
  // const { data } = await api.post<NutritionEstimate>('/food/ai-lookup', { query });
  return data;
}



// import api from './axios';
// import { USE_MOCKS } from '@/config';

// export type Meal = {
//   id: number;
//   name: string;
//   calories: number;
//   protein?: number;
//   carbs?: number;
//   fat?: number;
//   createdAt: string;
// };

// let mockMeals: Meal[] = [];
// const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// export async function listToday(): Promise<Meal[]> {
//   if (USE_MOCKS) {
//     await sleep();
//     return mockMeals;
//   }
//   const { data } = await api.get<Meal[]>('/food', { params: { date: 'today' } });
//   return data;
// }

// export async function createMeal(
//   input: Omit<Meal, 'id' | 'createdAt'>
// ): Promise<Meal> {
//   if (USE_MOCKS) {
//     await sleep();
//     const meal: Meal = { id: Date.now(), createdAt: new Date().toISOString(), ...input };
//     mockMeals = [meal, ...mockMeals];
//     return meal;
//   }
//   const { data } = await api.post<Meal>('/food', input);
//   return data;
// }

// export async function removeMeal(id: number): Promise<void> {
//   if (USE_MOCKS) {
//     await sleep();
//     mockMeals = mockMeals.filter((m) => m.id !== id);
//     return;
//   }
//   await api.delete(`/food/${id}`);
// }


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
