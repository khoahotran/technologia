import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRepository } from '../../infrastructure/repositories/auth/auth.repository';
import { UserRepository } from '../../infrastructure/repositories/user/user.repository';
import { ProductRepository } from '../../infrastructure/repositories/product/product.repository';
import { httpClient } from '../../infrastructure/http/client';

// Mock Axios
vi.mock('../../infrastructure/http/client', () => {
    return {
        httpClient: {
            post: vi.fn(),
            get: vi.fn(),
            put: vi.fn(),
            defaults: { headers: { common: {} } },
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() }
            }
        },
    };
});

describe('E-commerce Integration Flows', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Authentication Flow', () => {
        it('should login successfully and return token', async () => {
            const mockResponse = {
                data: {
                    data: {
                        accessToken: 'fake-access-token',
                        refreshToken: 'fake-refresh-token',
                        userId: 1
                    }
                }
            };

            // Typings for mock
            (httpClient.post as any).mockResolvedValue(mockResponse);

            const result = await AuthRepository.login({ username: 'test', password: 'password' });

            expect(httpClient.post).toHaveBeenCalledWith('/auth/login', { username: 'test', password: 'password' });
            expect(result).toEqual({
                token: 'fake-access-token',
                refreshToken: 'fake-refresh-token',
                userId: 1
            });
        });

        it('should register successfully', async () => {
            (httpClient.post as any).mockResolvedValue({ data: { success: true } });

            await AuthRepository.register({
                username: 'newuser',
                password: 'password',
                email: 'test@example.com'
            });

            expect(httpClient.post).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                username: 'newuser'
            }));
        });
    });

    describe('User Profile Flow', () => {
        it('should fetch user profile', async () => {
            const apiResponse = {
                userId: 1,
                username: 'test',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '1234567890',
                imageUrl: 'http://example.com/img.jpg',
                displayName: 'TestUser',
                // Extra fields returned by backend but stripped by Zod
                passwordHash: 'hidden',
                role: 'CUSTOMER'
            };

            const expectedProfile = {
                userId: 1,
                username: 'test',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                phoneNumber: '1234567890',
                imageUrl: 'http://example.com/img.jpg',
                displayName: 'TestUser'
            };

            // Axios response structure
            (httpClient.get as any).mockResolvedValue({ data: { data: apiResponse } });

            const profile = await UserRepository.getMe();

            expect(httpClient.get).toHaveBeenCalledWith('/users/profile/me');
            expect(profile).toEqual(expectedProfile);
        });

        it('should update user profile', async () => {
            const updateInput = {
                firstname: 'Updated',
                lastname: 'Name',
                email: 'new@example.com',
                phoneNumber: '123',
                displayName: 'Disp'
            };

            const apiResponse = {
                userId: 1,
                username: 'test',
                email: 'new@example.com',
                firstName: 'Updated',
                lastName: 'Name',
                phoneNumber: '123',
                imageUrl: null,
                displayName: 'Disp'
            };

            const expectedProfile = apiResponse;

            (httpClient.put as any).mockResolvedValue({ data: { data: apiResponse } });

            const result = await UserRepository.updateMe(updateInput);
            expect(httpClient.put).toHaveBeenCalledWith('/users/profile/me', updateInput);
            expect(result).toEqual(expectedProfile);
        });
    });

    describe('Product Flow', () => {
        it('should fetch all products', async () => {
            const mockProducts = [
                {
                    productId: 1, // API returns number
                    name: 'P1',
                    price: 100,
                    stockQuantity: 10,
                    status: 'AVAILABLE',
                    imageUrls: [],
                    description: 'desc',
                    brandName: 'Brand',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            (httpClient.get as any).mockResolvedValue({ data: mockProducts });

            const products = await ProductRepository.getAll();
            expect(httpClient.get).toHaveBeenCalledWith('/products');
            expect(products[0].productId).toBe(1); // Transformed to number
        });
    });
});
