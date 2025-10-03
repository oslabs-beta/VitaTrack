import api from './axios';
import { USE_MOCKS } from '@/config';

export type Workout = {
  id: number;
  type: string;        // display name
  duration: number;
  distance?: number;
  createdAt: string;
};

type WorkoutServer = {
  id: number;
  userId: number;
  workoutName: string;
  workoutType: 'cardio'|'strength'|'flexibility'|'sports'|string;
  duration: number;
  distance?: number;
  intensity?: 'low'|'moderate'|'high'|null;
  sets?: number|null;
  reps?: number|null;
  weight?: number|null;
  notes?: string|null;
  caloriesBurned?: number|null;
  workoutDate: string; // 'YYYY-MM-DD'
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
};

const toClient = (w: WorkoutServer): Workout => ({
  id: w.id,
  type: w.workoutName || w.workoutType,
  duration: w.duration,
  distance: w.distance ?? undefined,
  createdAt: w.createdAt,
});

const todayYMD = () => new Date().toISOString().slice(0, 10);

// ------------ MOCKS ------------
let mockWorkouts: Workout[] = [];
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// ------------ LIST (last 7d) ------------
export async function listRecent(): Promise<Workout[]> {
  if (USE_MOCKS) {
    await sleep();
    return mockWorkouts;
  }
  const endDate = todayYMD();
  const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  // GET /api/workouts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  const { data } = await api.get<WorkoutServer[]>('/api/workouts', { params: { startDate, endDate } });
  return data.map(toClient);
}

// ------------ CREATE ------------
export async function createWorkout(input: {
  type: string;        // e.g., 'Run', 'Upper Body'
  duration: number;
  distance?: number;
  notes?: string;
}): Promise<Workout> {
  if (USE_MOCKS) {
    await sleep();
    const w: Workout = {
      id: Date.now(),
      type: input.type,
      duration: input.duration,
      distance: input.distance,
      createdAt: new Date().toISOString(),
    };
    mockWorkouts = [w, ...mockWorkouts];
    return w;
  }

  // Derive required backend fields
  const workoutType = /run|walk|ride|row|swim|cardio/i.test(input.type) ? 'cardio' : 'strength';
  const body = {
    workoutName: input.type || 'Workout',
    workoutDate: todayYMD(),
    workoutType,
    duration: input.duration,
    distance: input.distance,
    notes: input.notes,
  };
  const { data } = await api.post<WorkoutServer>('/api/workouts', body);
  return toClient(data);
}

// ------------ DELETE ------------
export async function removeWorkout(id: number): Promise<void> {
  if (USE_MOCKS) {
    await sleep();
    mockWorkouts = mockWorkouts.filter((w) => w.id !== id);
    return;
  }
  await api.delete(`/api/workouts/${id}`);
}


// import api from './axios';
// import { USE_MOCKS } from '@/config';

// export type Workout = {
//   id: number;
//   type: string;       // e.g., Run / Lift / Swim / Bike
//   duration: number;   // minutes
//   distance?: number;  // optional (km/mi)
//   createdAt: string;
// };

// let mockWorkouts: Workout[] = [];
// const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

// export async function listRecent(): Promise<Workout[]> {
//   if (USE_MOCKS) {
//     await sleep();
//     return mockWorkouts;
//   }
//   const { data } = await api.get<Workout[]>('/workouts', { params: { range: '7d' } });
//   return data;
// }

// export async function createWorkout(
//   input: Omit<Workout, 'id' | 'createdAt'>
// ): Promise<Workout> {
//   if (USE_MOCKS) {
//     await sleep();
//     const w: Workout = { id: Date.now(), createdAt: new Date().toISOString(), ...input };
//     mockWorkouts = [w, ...mockWorkouts];
//     return w;
//   }
//   const { data } = await api.post<Workout>('/workouts', input);
//   return data;
// }

// export async function suggestions(): Promise<string[]> {
//   if (USE_MOCKS) {
//     await sleep();
//     return [
//       'Easy Run — 20 min',
//       'Upper Body Push — 30 min',
//       'Mobility & Core — 15 min',
//     ];
//   }
//   const { data } = await api.get<string[]>('/workouts/suggestions');
//   return data;
// }

// export async function removeWorkout(id: number): Promise<void> {
//   if (USE_MOCKS) {
//     await sleep();
//     mockWorkouts = mockWorkouts.filter(w => w.id !== id);
//     return;
//   }
//   await api.delete(`/workouts/${id}`);
// }
