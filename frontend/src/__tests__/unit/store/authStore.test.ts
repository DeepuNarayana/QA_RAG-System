import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthStore } from '../../../store/authStore';
import * as authService from '../../../services/auth';

vi.mock('../../../services/auth', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with null values', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
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

    const mockResponse = {
      user: mockUser,
      access_token: 'test-token-123',
      token_type: 'bearer'
    };

    vi.mocked(authService.authService.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('testuser', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token-123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle login error', async () => {
    const mockError = new Error('Invalid credentials');
    vi.mocked(authService.authService.login).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.login('testuser', 'wrongpassword');
      } catch (e) {
        // Error expected
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set loading state during login', async () => {
    vi.mocked(authService.authService.login).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        user: {} as any,
        access_token: 'token',
        token_type: 'bearer'
      }), 100))
    );

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login('user', 'pass');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = {
      id: 2,
      username: 'newuser',
      email: 'new@example.com',
      full_name: 'New User',
      role: 'user' as const,
      is_active: true,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    };

    vi.mocked(authService.authService.register).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.register('newuser', 'new@example.com', 'password123', 'New User');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle registration error', async () => {
    const mockError = new Error('Email already exists');
    vi.mocked(authService.authService.register).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.register('user', 'existing@example.com', 'pass', 'User');
      } catch (e) {
        // Error expected
      }
    });

    expect(result.current.error).toBe('Email already exists');
  });

  it('should logout user', () => {
    const { result } = renderHook(() => useAuthStore());

    // Set initial state
    act(() => {
      useAuthStore.setState({
        user: { id: 1 } as any,
        token: 'token-123'
      });
    });

    expect(result.current.user).not.toBeNull();
    expect(result.current.token).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(vi.mocked(authService.authService.logout)).toHaveBeenCalled();
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      useAuthStore.setState({ error: 'Some error' });
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should initialize from storage', () => {
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

    localStorage.setItem('access_token', 'stored-token');
    vi.mocked(authService.authService.getCurrentUser).mockReturnValue(mockUser);

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.initializeFromStorage();
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('stored-token');
  });
});
