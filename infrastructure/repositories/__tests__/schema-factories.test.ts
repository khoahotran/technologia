/**
 * Zod Schema Factory Unit Tests
 * Tests that the schema factory functions in base.repository correctly:
 * - Accept valid data shapes
 * - Reject invalid/missing fields (Zod parse throws)
 * These schemas are the first data defence layer before any business logic runs.
 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
    createPaginatedResponseSchema,
    createEntityResponseSchema,
    createArrayResponseSchema,
} from '../base.repository'

const TestSchema = z.object({ id: z.string(), value: z.number() })

describe('createPaginatedResponseSchema', () => {
    const schema = createPaginatedResponseSchema(TestSchema)

    it('should parse a valid paginated response', () => {
        const valid = {
            status: 200,
            page_number: 0,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            data: [{ id: 'x', value: 42 }],
            message: 'OK',
        }
        const result = schema.parse(valid)
        expect(result.data).toHaveLength(1)
        expect(result.count_items).toBe(1)
    })

    it('should throw when required fields are missing', () => {
        const invalid = { status: 200, data: [{ id: 'x', value: 42 }] }
        expect(() => schema.parse(invalid)).toThrow()
    })

    it('should throw when an entity in data fails validation', () => {
        const invalid = {
            status: 200,
            page_number: 0,
            page_size: 10,
            count_items: 1,
            count_pages: 1,
            data: [{ id: 'x', value: 'not-a-number' }], // value must be number
            message: 'OK',
        }
        expect(() => schema.parse(invalid)).toThrow()
    })
})

describe('createEntityResponseSchema', () => {
    const schema = createEntityResponseSchema(TestSchema)

    it('should parse a valid single-entity response', () => {
        const valid = { data: { id: 'a', value: 99 }, message: 'OK' }
        expect(schema.parse(valid).data.value).toBe(99)
    })

    it('should throw when entity data is invalid', () => {
        const invalid = { data: { id: 'a', value: 'bad' } }
        expect(() => schema.parse(invalid)).toThrow()
    })
})

describe('createArrayResponseSchema', () => {
    const schema = createArrayResponseSchema(TestSchema)

    it('should parse a valid array response', () => {
        const valid = { data: [{ id: 'b', value: 7 }] }
        expect(schema.parse(valid).data).toHaveLength(1)
    })

    it('should throw when array contains invalid items', () => {
        const invalid = { data: [{ id: 'b', value: null }] }
        expect(() => schema.parse(invalid)).toThrow()
    })
})
