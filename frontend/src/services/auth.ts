/**
 * Authentication Service
 */

import { AuthResponse, User } from '../types';
import api from './api';

export const authService = {
  /**
   * Register a new user
   */
  async register(
    username: string,
    email: string,
    password: string,
    full_name?: string
  ): Promise<User> {
    try {
      const response = await api.post<User>('/auth/register', {
        username,
        email,
        password,
        full_name,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  /**
   * Login user
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      });

      // Store token
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from storage
   */
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};
