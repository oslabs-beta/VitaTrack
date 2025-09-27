import { create } from 'zustand';

export type AuthUser = { id: number; email: string; roles?: string[] } | null;

type AuthState = {
  token: string | null;        // Bearer JWT if your backend returns one; null if cookie-based
  user: AuthUser;              // current user (or null)
  setAuth: (token: string | null, user: AuthUser) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  logout: () => set({ token: null, user: null }),
}));
