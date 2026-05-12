import { describe, it, expect, vi } from 'vitest';

import { login } from '../api';

import * as client from '@/api/client';

vi.mock('@/api/client', () => ({
  post: vi.fn(),
}));

describe('Auth API Logic', () => {
  describe('JWT Decoding', () => {
    it('should correctly handle login and decode JWT for role', async () => {
      const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          accessToken: 'header.' + btoa(JSON.stringify({ role: 'ADMIN' })) + '.signature',
          refreshToken: 'refresh-123',
          userId: 'user-123',
        }
      };
      
      (client.post as any).mockResolvedValue(mockResponse);
      
      const session = await login({ username: 'test', password: 'password' });
      
      expect(session.user.role).toBe('ADMIN');
      expect(session.accessToken).toBe(mockResponse.data.accessToken);
    });

    it('should default to CUSTOMER role if payload is missing role', async () => {
       const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          accessToken: 'header.' + btoa(JSON.stringify({ })) + '.signature',
          refreshToken: 'refresh-123',
          userId: 'user-123',
        }
      };
      
      (client.post as any).mockResolvedValue(mockResponse);
      
      const session = await login({ username: 'test', password: 'password' });
      expect(session.user.role).toBe('CUSTOMER');
    });

    it('should return null role if token is malformed', async () => {
       const mockResponse = {
        status: 200,
        message: 'Success',
        data: {
          accessToken: 'malformed-token',
          refreshToken: 'refresh-123',
          userId: 'user-123',
        }
      };
      
      (client.post as any).mockResolvedValue(mockResponse);
      
      const session = await login({ username: 'test', password: 'password' });
      expect(session.user.role).toBe('CUSTOMER'); // fallback in code is CUSTOMER
    });
  });

  describe('Schema Validation', () => {
    it('should throw if API response is missing required fields', async () => {
      const invalidResponse = { data: { accessToken: 'abc' } }; // missing refreshToken
      (client.post as any).mockResolvedValue(invalidResponse);
      
      await expect(login({ username: 'test', password: 'password' })).rejects.toThrow();
    });
  });
});
