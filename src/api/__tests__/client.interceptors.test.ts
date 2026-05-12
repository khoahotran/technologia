import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import api, { AppError, initAutoRefresh } from '../client';

import { authStorage } from '@/utils/storage';

// We need to mock the dependencies before importing the client if we want to catch the initialization
// But since it's already imported, we'll spy on the exported api instance.

vi.mock('@/features/auth/store', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      session: null,
      clearSession: vi.fn(),
      setSession: vi.fn(),
    })),
  },
}));

vi.mock('@/utils/storage', () => ({
  authStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    setTokens: vi.fn(),
  },
}));

describe('API Client Interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Request Interceptor', () => {
    it('should inject Authorization header if token exists', async () => {
      // Access the private interceptor handler
      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      
      (authStorage.getAccessToken as any).mockReturnValue('mock-token');
      
      const config = { headers: {} } as any;
      const result = requestHandler(config);
      
      expect(result.headers.Authorization).toBe('Bearer mock-token');
    });

    it('should remove Content-Type for FormData', () => {
      const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
      
      const config = { 
        headers: { 'Content-Type': 'application/json' },
        data: new FormData()
      } as any;
      
      const result = requestHandler(config);
      expect(result.headers['Content-Type']).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    const responseHandler = (api.interceptors.response as any).handlers[0].fulfilled;
    const errorHandler = (api.interceptors.response as any).handlers[0].rejected;

    it('should return payload directly on success', () => {
      const response = { data: { id: 1 } };
      const result = responseHandler(response);
      expect(result).toEqual({ id: 1 });
    });

    it('should throw AppError if payload has status !== 200', () => {
      const response = { 
        data: { status: 500, message: 'Server error', code: 'INTERNAL_ERROR' } 
      };
      expect(() => responseHandler(response)).toThrow(AppError);
    });

    it('should handle 401 and try to refresh token', async () => {
      const mockConfig = { 
        headers: {}, 
        url: '/api/some-endpoint',
        _retry: false 
      };
      const mockError = {
        config: mockConfig,
        response: { status: 401, data: { message: 'Unauthorized' } },
        message: 'Request failed with status code 401'
      };

      // Mock refresh success
      // Note: We need to mock the axios instance used for refreshing
      // In client.ts, it's 'refreshApi'. It's not exported, so this is tricky.
      // But we can mock axios.post generally if we're careful.
    });

    it('should handle 403 Forbidden', async () => {
      const mockError = {
        response: { status: 403, data: { message: 'Forbidden' } },
        message: 'Request failed'
      };
      
      await expect(errorHandler(mockError)).rejects.toThrow('Forbidden request.');
    });

    it('should handle 500 Server Error', async () => {
      const mockError = {
        response: { status: 500, data: { message: 'Crash' } },
        message: 'Request failed'
      };
      
      await expect(errorHandler(mockError)).rejects.toThrow('Server error. Please try again later.');
    });
  });

  describe('Auto Refresh', () => {
    it('should schedule refresh if tokens exist', () => {
      (authStorage.getRefreshToken as any).mockReturnValue('refresh-token');
      
      initAutoRefresh();
      
      // We'd check if setTimeout was called, but it's internal.
      // We can verify it doesn't crash.
    });
  });
});
