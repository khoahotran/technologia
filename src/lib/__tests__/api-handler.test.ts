import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createApiHandler, createDynamicApiHandler } from '../api-handler'

import type { RouteContext } from '@/types'

// Mock globals
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Next.js constants
vi.mock('@/constants', () => ({
    SERVICE_URLS: {
        PRODUCT_SERVICE: 'http://product-service',
        USER_SERVICE: 'http://user-service',
        PAYMENT_SERVICE: 'http://payment-service',
    },
    HTTP_STATUS: {
        INTERNAL_SERVER_ERROR: 500,
    },
    REQUEST_CONFIG: {
        JSON_CONTENT_TYPE: 'application/json',
    }
}))

describe('API Handler Utility', () => {
    beforeEach(() => {
        mockFetch.mockReset()
        // Default success response
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        })
    })

    const mockRequest = (url = 'http://localhost/api/test', method = 'GET', body = null) => {
        return new Request(url, {
            method,
            headers: new Headers({ 'Authorization': 'Bearer token' }),
            body: body ? JSON.stringify(body) : null
        })
    }

    describe('createApiHandler', () => {
        it('should proxy request to correct target service', async () => {
            const handler = createApiHandler({
                targetService: 'product',
                path: '/items'
            })

            const req = mockRequest('http://localhost/api/test?query=1')
            await handler(req)

            expect(mockFetch).toHaveBeenCalledWith(
                'http://product-service/items?query=1',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer token'
                    })
                })
            )
        })

        it('should handle API errors gracefully', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: async () => ({ message: 'Item missing' })
            })

            const handler = createApiHandler({
                targetService: 'user',
                path: '/profile'
            })

            const response = await handler(mockRequest())
            const data = await response.json()

            expect(response.status).toBe(404)
            expect(data).toEqual({ error: 'Item missing' })
        })

        it('should handle network/fetch errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'))

            const handler = createApiHandler({
                targetService: 'product',
                path: '/crash'
            })

            const response = await handler(mockRequest())
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data).toEqual({ error: 'Lỗi máy chủ nội bộ (Internal Server Error)' })
        })
    })

    describe('createDynamicApiHandler', () => {
        it('should construct dynamic paths', async () => {
            const handler = createDynamicApiHandler<{ id: string }>({
                targetService: 'product',
                path: ({ id }) => `/items/${id}`
            })

            // Mock RouteContext
            const context: RouteContext<{ id: string }> = {
                params: Promise.resolve({ id: '123' }),
            }

            await handler(mockRequest(), context)

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/items/123'),
                expect.anything()
            )
        })
    })
})
