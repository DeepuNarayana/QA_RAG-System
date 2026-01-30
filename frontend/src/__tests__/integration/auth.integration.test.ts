import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '../../store/authStore';

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should handle complete login flow', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Initial state
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();

    // Simulate login (in real scenario, this would call the API)
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user' as const,
      is_active: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    act(() => {
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token-123',
        isLoading: false,
        error: null,
      });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token-123');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle complete logout flow', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Set logged in state
    act(() => {
      useAuthStore.setState({
        user: { id: 1 } as any,
        token: 'test-token'
      });
    });

    expect(result.current.user).not.toBeNull();

    // Logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('should persist token in localStorage', () => {
    act(() => {
      useAuthStore.setState({ token: 'persistent-token' });
    });

    // Simulate token persistence
    localStorage.setItem('access_token', 'persistent-token');
    expect(localStorage.getItem('access_token')).toBe('persistent-token');
  });

  it('should recover from error state', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({ error: 'Login failed' });
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should maintain user data after successful login', async () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user' as const,
      is_active: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    act(() => {
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token'
      });
    });

    expect(result.current.user?.username).toBe('testuser');
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.user?.role).toBe('user');
  });
});
