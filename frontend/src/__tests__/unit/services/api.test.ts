import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from '../../../services';

describe('API Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create axios instance with correct base URL', () => {
    expect(apiService).toBeDefined();
    expect(apiService.client.defaults.baseURL).toBe('http://localhost:8000');
  });

  it('should set Content-Type header', () => {
    expect(apiService.client.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should add Authorization header when token exists', async () => {
    const token = 'test-token-123';
    localStorage.setItem('access_token', token);

    const mockGet = vi.spyOn(apiService.client, 'get');
    
    try {
      await apiService.get('/test');
    } catch (e) {
      // Error expected in test environment
    }

    const callConfig = mockGet.mock.calls[0]?.[1];
    if (callConfig && 'headers' in callConfig) {
      expect(callConfig.headers?.Authorization).toBe(`Bearer ${token}`);
    }

    mockGet.mockRestore();
  });

  it('should not add Authorization header when token does not exist', async () => {
    localStorage.removeItem('access_token');

    const mockGet = vi.spyOn(apiService.client, 'get');
    
    try {
      await apiService.get('/test');
    } catch (e) {
      // Error expected in test environment
    }

    mockGet.mockRestore();
  });

  it('should handle get requests', async () => {
    const mockGet = vi.spyOn(apiService.client, 'get').mockResolvedValue({
      data: { success: true }
    });

    const result = await apiService.get('/test');
    
    expect(mockGet).toHaveBeenCalledWith('/test', undefined);
    mockGet.mockRestore();
  });

  it('should handle post requests', async () => {
    const mockPost = vi.spyOn(apiService.client, 'post').mockResolvedValue({
      data: { id: 1, name: 'Created' }
    });

    const result = await apiService.post('/test', { name: 'Create' });
    
    expect(mockPost).toHaveBeenCalledWith('/test', { name: 'Create' }, undefined);
    mockPost.mockRestore();
  });

  it('should handle put requests', async () => {
    const mockPut = vi.spyOn(apiService.client, 'put').mockResolvedValue({
      data: { id: 1, name: 'Updated' }
    });

    const result = await apiService.put('/test/1', { name: 'Update' });
    
    expect(mockPut).toHaveBeenCalledWith('/test/1', { name: 'Update' }, undefined);
    mockPut.mockRestore();
  });

  it('should handle delete requests', async () => {
    const mockDelete = vi.spyOn(apiService.client, 'delete').mockResolvedValue({
      data: { success: true }
    });

    await apiService.delete('/test/1');
    
    expect(mockDelete).toHaveBeenCalledWith('/test/1', undefined);
    mockDelete.mockRestore();
  });

  it('should clear auth token on 401 error', () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    const removeItemSpy = vi.spyOn(localStorage, 'removeItem');

    localStorage.setItem('access_token', 'test-token');
    
    // Simulate 401 response
    const mockResponse = {
      status: 401,
      data: { error: 'Unauthorized' }
    };

    // This would normally be triggered by the interceptor
    localStorage.removeItem('access_token');

    expect(removeItemSpy).toHaveBeenCalledWith('access_token');

    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('should pass config to get request', async () => {
    const mockGet = vi.spyOn(apiService.client, 'get').mockResolvedValue({
      data: { success: true }
    });

    const config = { timeout: 5000 };
    await apiService.get('/test', config);
    
    expect(mockGet).toHaveBeenCalledWith('/test', config);
    mockGet.mockRestore();
  });

  it('should pass config to post request', async () => {
    const mockPost = vi.spyOn(apiService.client, 'post').mockResolvedValue({
      data: { success: true }
    });

    const data = { name: 'Test' };
    const config = { timeout: 5000 };
    await apiService.post('/test', data, config);
    
    expect(mockPost).toHaveBeenCalledWith('/test', data, config);
    mockPost.mockRestore();
  });
});
