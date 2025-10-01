import api from './axios';
import { USE_MOCKS } from '@/config';
let mockGoals = { dailyCalories: 2000, weeklyWorkouts: 3 };
const sleep = (ms = 250) => new Promise((r) => setTimeout(r, ms));
export async function getGoals() {
    if (USE_MOCKS) {
        await sleep();
        return mockGoals;
    }
    const { data } = await api.get('/goals');
    return data;
}
export async function upsertGoals(input) {
    if (USE_MOCKS) {
        await sleep();
        mockGoals = { ...mockGoals, ...input };
        return mockGoals;
    }
    const { data } = await api.post('/goals', input);
    return data;
}
