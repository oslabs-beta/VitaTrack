import api from './axios';
import { USE_MOCKS } from '@/config';

export type Workout = {
  id: number;
  type: string;       // e.g., Run / Lift / Swim / Bike
  duration: number;   // minutes
  distance?: number;  // optional (km/mi)
  createdAt: string;
};

let mockWorkouts: Workout[] = [];
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export async function listRecent(): Promise<Workout[]> {
  if (USE_MOCKS) {
    await sleep();
    return mockWorkouts;
  }
  const { data } = await api.get<Workout[]>('/workouts', { params: { range: '7d' } });
  return data;
}

export async function createWorkout(
  input: Omit<Workout, 'id' | 'createdAt'>
): Promise<Workout> {
  if (USE_MOCKS) {
    await sleep();
    const w: Workout = { id: Date.now(), createdAt: new Date().toISOString(), ...input };
    mockWorkouts = [w, ...mockWorkouts];
    return w;
  }
  const { data } = await api.post<Workout>('/workouts', input);
  return data;
}

export async function suggestions(): Promise<string[]> {
  if (USE_MOCKS) {
    await sleep();
    return [
      'Easy Run — 20 min',
      'Upper Body Push — 30 min',
      'Mobility & Core — 15 min',
    ];
  }
  const { data } = await api.get<string[]>('/workouts/suggestions');
  return data;
}

export async function removeWorkout(id: number): Promise<void> {
  if (USE_MOCKS) {
    await sleep();
    mockWorkouts = mockWorkouts.filter(w => w.id !== id);
    return;
  }
  await api.delete(`/workouts/${id}`);
}
