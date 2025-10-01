// import { create } from 'zustand';
// export type AuthUser = { id: number; email: string; roles?: string[] } | null;
// type AuthState = {
//   token: string | null;        // Bearer JWT if your backend returns one; null if cookie-based
//   user: AuthUser;              // current user (or null)
//   setAuth: (token: string | null, user: AuthUser) => void;
//   logout: () => void;
// };
// export const useAuth = create<AuthState>((set) => ({
//   token: null,
//   user: null,
//   setAuth: (token, user) => set({ token, user }),
//   logout: () => set({ token: null, user: null }),
// }));
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useAuth = create()(persist((set, get) => ({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    setAuth: (token, user) => set({
        token,
        user,
        isAuthenticated: !!(token && user)
    }),
    logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false
    }),
    setLoading: (loading) => set({ isLoading: loading }),
    validateToken: async () => {
        const { token } = get();
        if (!token) {
            return false;
        }
        try {
            const response = await fetch('http://localhost:5001/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    set({
                        user: result.data.user,
                        isAuthenticated: true
                    });
                    return true;
                }
            }
        }
        catch (error) {
            console.error('Token validation failed:', error);
        }
        // Token is invalid, logout
        get().logout();
        return false;
    },
}), {
    name: 'auth-storage',
    partialize: (state) => ({
        token: state.token,
        user: state.user
    }),
}));
