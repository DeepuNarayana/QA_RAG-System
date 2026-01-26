/**
 * Auth Store (Zustand)
 */

import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(username, password);
      set({
        user: response.user,
        token: response.access_token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (username: string, email: string, password: string, fullName?: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(username, email, password, fullName);
      set({
        isLoading: false,
      });
      // After registration, user should login
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeFromStorage: () => {
    const user = authService.getCurrentUser();
    const token = localStorage.getItem('access_token');
    if (user && token) {
      set({ user, token });
    }
  },
}));
