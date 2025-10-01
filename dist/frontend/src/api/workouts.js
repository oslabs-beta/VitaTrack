import api from './axios';
import { USE_MOCKS } from '@/config';
let mockWorkouts = [];
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));
export async function listRecent() {
    if (USE_MOCKS) {
        await sleep();
        return mockWorkouts;
    }
    const { data } = await api.get('/workouts', { params: { range: '7d' } });
    return data;
}
export async function createWorkout(input) {
    if (USE_MOCKS) {
        await sleep();
        const w = { id: Date.now(), createdAt: new Date().toISOString(), ...input };
        mockWorkouts = [w, ...mockWorkouts];
        return w;
    }
    const { data } = await api.post('/workouts', input);
    return data;
}
export async function suggestions() {
    if (USE_MOCKS) {
        await sleep();
        return [
            'Easy Run — 20 min',
            'Upper Body Push — 30 min',
            'Mobility & Core — 15 min',
        ];
    }
    const { data } = await api.get('/workouts/suggestions');
    return data;
}
export async function removeWorkout(id) {
    if (USE_MOCKS) {
        await sleep();
        mockWorkouts = mockWorkouts.filter(w => w.id !== id);
        return;
    }
    await api.delete(`/workouts/${id}`);
}
