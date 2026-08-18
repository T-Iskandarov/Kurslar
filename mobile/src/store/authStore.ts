import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

export interface User {
  id: number;
  phone: string;
  full_name: string;
  birth_date: string | null;
  gender: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (tokens: { access: string; refresh: string }, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        // Fetch user profile
        const response = await apiClient.get('/auth/profile/');
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  login: async (tokens, user) => {
    await AsyncStorage.setItem('access_token', tokens.access);
    await AsyncStorage.setItem('refresh_token', tokens.refresh);
    set({ user, isAuthenticated: true });
  },
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
  updateUser: (user) => set({ user }),
}));
