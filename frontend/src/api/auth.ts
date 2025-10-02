import api from './axios';
import type { AuthUser } from '@/stores/useAuth';

export type AuthResponse = { token?: string; user: Exclude<AuthUser, null> };

export const login = (body: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/login', body).then(r => r.data);

export const register = (body: { email: string; password: string }) =>
  api.post<AuthResponse>('/auth/register', body).then(r => r.data);

export const me = () => api.get<AuthUser>('/auth/me').then(r => r.data);

export const logoutApi = () => api.post<void>('/auth/logout'); // optional
