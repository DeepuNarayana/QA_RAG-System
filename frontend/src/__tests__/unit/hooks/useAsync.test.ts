import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAsync } from '../../../hooks/useAsync';

describe('useAsync Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const asyncFunction = vi.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(asyncFunction));
    expect(result.current.loading).toBe(true);
  });

  it('should set data when async function resolves', async () => {
    const mockData = { id: 1, name: 'Test' };
    const asyncFunction = vi.fn(() => Promise.resolve(mockData));
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
  });

  it('should set error when async function rejects', async () => {
    const mockError = new Error('Test error');
    const asyncFunction = vi.fn(() => Promise.reject(mockError));
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('should not execute immediately when immediate is false', () => {
    const asyncFunction = vi.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(asyncFunction, false));
    
    expect(result.current.loading).toBe(false);
    expect(asyncFunction).not.toHaveBeenCalled();
  });

  it('should execute function when execute is called', async () => {
    const mockData = 'executed data';
    const asyncFunction = vi.fn(() => Promise.resolve(mockData));
    
    const { result } = renderHook(() => useAsync(asyncFunction, false));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toBe(mockData);
  });

  it('should handle string errors', async () => {
    const asyncFunction = vi.fn(() => Promise.reject('String error'));
    
    const { result } = renderHook(() => useAsync(asyncFunction));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('String error');
  });

  it('should reset state when execute is called again', async () => {
    const asyncFunction = vi.fn(() => Promise.resolve('data'));
    const { result } = renderHook(() => useAsync(asyncFunction, false));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.data).toBe('data');
    expect(result.current.error).toBeNull();
    
    // Call again with error
    asyncFunction.mockRejectedValueOnce(new Error('New error'));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch {}
    });
    
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(new Error('New error'));
  });

  it('should return data from execute', async () => {
    const mockData = 'returned data';
    const asyncFunction = vi.fn(() => Promise.resolve(mockData));
    
    const { result } = renderHook(() => useAsync(asyncFunction, false));
    
    let returnedData;
    await act(async () => {
      returnedData = await result.current.execute();
    });
    
    expect(returnedData).toBe(mockData);
  });
});
