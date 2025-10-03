import api from './axios';
import { USE_MOCKS } from '@/config';

// ---------- Client shape your pages use ----------
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
  confidence?: number;
  source?: string;
};

// ---------- Server shape per backend doc ----------
type MealServer = {
  id: number;
  userId: number;
  foodName: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  loggedDate: string;   // 'YYYY-MM-DD' or ISO midnight
  createdAt: string;
  updatedAt: string;
};

const toClient = (m: MealServer): Meal => ({
  id: m.id,
  name: m.foodName,
  calories: m.calories,
  protein: m.protein ?? 0,
  carbs: m.carbs ?? 0,
  fat: m.fat ?? 0,
  createdAt: m.createdAt,
});

const todayYMD = () => new Date().toISOString().slice(0, 10);

// ------------ MOCKS (in-memory) ------------
let mockMeals: Meal[] = [];
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ------------ READ ------------
export async function listToday(): Promise<Meal[]> {
  if (USE_MOCKS) {
    await sleep();
    return mockMeals;
  }
  // GET /api/food-logs/daily/:date
  const { data } = await api.get<MealServer[]>(`/food-logs/daily/${todayYMD()}`);
  return data.map(toClient);
}

// ------------ CREATE ------------
export async function createMeal(input: {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // later you can add: mealType, servingSize, servingUnit, loggedDate
}): Promise<Meal> {
  if (USE_MOCKS) {
    await sleep();
    const meal: Meal = {
      id: Date.now(),
      name: input.name,
      calories: input.calories,
      protein: input.protein ?? 0,
      carbs: input.carbs ?? 0,
      fat: input.fat ?? 0,
      createdAt: new Date().toISOString(),
    };
    mockMeals = [meal, ...mockMeals];
    return meal;
  }

  // Server requires more fields; supply safe defaults until UI adds them
  const body = {
    loggedDate: todayYMD(),
    mealType: 'snack',        // default
    foodName: input.name,
    calories: input.calories,
    protein: input.protein ?? 0,
    carbs: input.carbs ?? 0,
    fat: input.fat ?? 0,
    servingSize: 1,           // default
    servingUnit: 'unit',      // default
  };
  const { data } = await api.post<MealServer>('/food-logs', body);
  return toClient(data);
}

// ------------ DELETE ------------
export async function removeMeal(id: number): Promise<void> {
  if (USE_MOCKS) {
    await sleep();
    mockMeals = mockMeals.filter((m) => m.id !== id);
    return;
  }
  await api.delete(`/food-logs/${id}`);
}

// ------------ AI LOOKUP (Design A prefill) ------------
export async function aiLookup(query: string): Promise<NutritionEstimate> {
  if (!query.trim()) throw new Error('empty query');

  if (USE_MOCKS) {
    await sleep(400);
    const q = query.toLowerCase();
    let est: NutritionEstimate = { name: query, calories: 400, protein: 20, carbs: 40, fat: 15 };
    if (q.includes('chicken')) est = { name: query, calories: 450, protein: 35, carbs: 10, fat: 20 };
    if (q.includes('salad'))   est = { name: query, calories: 320, protein: 15, carbs: 18, fat: 20 };
    if (q.includes('oat'))     est = { name: query, calories: 300, protein: 10, carbs: 50, fat: 5 };
    if (q.includes('burger'))  est = { name: query, calories: 650, protein: 30, carbs: 50, fat: 35 };
    return est;
  }

  // When Kevin adds it, wire to the real endpoint here.
  // Without that, this call will 404 and your UI will toast an error.
  const { data } = await api.get<NutritionEstimate>('/food-logs/ai-lookup', { params: { query } });
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

// export type NutritionEstimate = {
//   name: string;
//   calories: number;
//   protein?: number;
//   carbs?: number;
//   fat?: number;
//   confidence?: number;   // optional, for real API
//   source?: string;       // optional, for real API
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

// /** AI lookup: pre-fill the form with estimated macros */
// export async function aiLookup(query: string): Promise<NutritionEstimate> {
//   if (!query.trim()) throw new Error('empty query');

//   if (USE_MOCKS) {
//     await sleep(400);
//     // naive, rule-based mock just to make the UI flow feel real
//     const q = query.toLowerCase();
//     let est: NutritionEstimate = { name: query, calories: 400, protein: 20, carbs: 40, fat: 15 };
//     if (q.includes('chicken')) est = { name: query, calories: 450, protein: 35, carbs: 10, fat: 20 };
//     if (q.includes('salad'))   est = { name: query, calories: 320, protein: 15, carbs: 18, fat: 20 };
//     if (q.includes('oat'))     est = { name: query, calories: 300, protein: 10, carbs: 50, fat: 5 };
//     if (q.includes('burger'))  est = { name: query, calories: 650, protein: 30, carbs: 50, fat: 35 };
//     return est;
//   }

//   // Real API: choose GET or POST (agree with backend)
//   // GET example:
//   const { data } = await api.get<NutritionEstimate>('/food/ai-lookup', { params: { query } });
//   // POST example:
//   // const { data } = await api.post<NutritionEstimate>('/food/ai-lookup', { query });
//   return data;
// }



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
