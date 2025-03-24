import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, bettingApi, setupAxiosInterceptors } from '../lib/axios';

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  balance: number;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  fetchBalance: () => Promise<void>;
  updateUsername: (newUsername: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      username: null,
      balance: 0,
      isAuthenticated: false,
      login: async (email, password) => {
        const response = await authApi.post('/login', { email, password });
        const { token, userId, username } = response.data;
        setupAxiosInterceptors(token);
        set({ token, userId, username, isAuthenticated: true });
        // Fetch initial balance after login
        const balanceResponse = await bettingApi.get('/betting/balance');
        set({ balance: balanceResponse.data.balance });
      },
      register: async (username, email, password) => {
        const response = await authApi.post('/register', { username, email, password });
        const { token, userId } = response.data;
        setupAxiosInterceptors(token);
        set({ token, userId, username, isAuthenticated: true });
        // Fetch initial balance after registration
        const balanceResponse = await bettingApi.get('/betting/balance');
        set({ balance: balanceResponse.data.balance });
      },
      logout: () => {
        set({ token: null, userId: null, username: null, balance: 0, isAuthenticated: false });
      },
      updateBalance: (newBalance) => {
        set({ balance: newBalance });
      },
      fetchBalance: async () => {
        const response = await bettingApi.get('/betting/balance');
        set({ balance: response.data.balance });
      },
      updateUsername: (newUsername) => {
        set({ username: newUsername });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);