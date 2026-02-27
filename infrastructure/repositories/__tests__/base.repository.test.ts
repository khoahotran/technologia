import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

import { createBaseRepository } from '../base.repository'

import { httpClient } from '@/infrastructure/http/client'

// Mock httpClient
vi.mock('@/infrastructure/http/client', () => ({
    httpClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }
}))

// Define a simple schema for testing
const TestSchema = z.object({
    id: z.string(),
    name: z.string(),
})
type TestEntity = z.infer<typeof TestSchema>

describe('Base Repository Factory', () => {
    const repository = createBaseRepository<TestEntity>({
        basePath: '/test-resource',
        entitySchema: TestSchema
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getById', () => {
        it('should fetch and parse entity', async () => {
            const mockData = { id: '1', name: 'Test Item' }
            vi.mocked(httpClient.get).mockResolvedValue({
                data: { data: mockData, status: 200 }
            })

            const result = await repository.getById('1')

            expect(httpClient.get).toHaveBeenCalledWith('/test-resource/1')
            expect(result).toEqual(mockData)
        })

        it('should throw if schema validation fails', async () => {
            const invalidData = { id: '1', name: 123 } // Name should be string
            vi.mocked(httpClient.get).mockResolvedValue({
                data: { data: invalidData }
            })

            await expect(repository.getById('1')).rejects.toThrow()
        })
    })

    describe('getAll', () => {
        it('should fetch and parse array response', async () => {
            const mockData = [{ id: '1', name: 'A' }, { id: '2', name: 'B' }]
            vi.mocked(httpClient.get).mockResolvedValue({
                data: { data: mockData }
            })

            const result = await repository.getAll()
            expect(result).toHaveLength(2)
            expect(result[0]!.name).toBe('A')
        })
    })

    describe('create', () => {
        it('should post payload and return created entity', async () => {
            const payload = { name: 'New Item' }
            const mockResponse = { id: '3', name: 'New Item' }

            vi.mocked(httpClient.post).mockResolvedValue({
                data: { data: mockResponse }
            })

            const result = await repository.create(payload)

            expect(httpClient.post).toHaveBeenCalledWith('/test-resource', payload)
            expect(result).toEqual(mockResponse)
        })
    })

    describe('delete', () => {
        it('should call delete endpoint', async () => {
            vi.mocked(httpClient.delete).mockResolvedValue({ data: {} })

            await repository.delete('1')
            expect(httpClient.delete).toHaveBeenCalledWith('/test-resource/1')
        })
    })

    describe('getPaged', () => {
        it('should fetch paginated data with correct params', async () => {
            const mockPagedData = {
                status: 200,
                page_number: 0,
                page_size: 10,
                count_items: 1,
                count_pages: 1,
                data: [{ id: '1', name: 'A' }],
                message: 'Success'
            }

            vi.mocked(httpClient.get).mockResolvedValue({
                data: mockPagedData
            })

            const result = await repository.getPaged({ page: 1, size: 20 })

            expect(httpClient.get).toHaveBeenCalledWith(
                '/test-resource/paged',
                expect.objectContaining({
                    params: expect.objectContaining({ page: 1, size: 20 })
                })
            )
            expect(result.data).toHaveLength(1)
        })
    })
})
