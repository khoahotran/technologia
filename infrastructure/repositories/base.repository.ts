/**
 * Base Repository
 * Abstract base class providing common CRUD operations
 */

import { z, ZodSchema } from "zod";
import { httpClient } from "@/infrastructure/http/client";
import type { PaginatedResponse, ApiResponse } from "@/shared/types";

// ===========================================
// Types
// ===========================================

export interface PagingParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "ASC" | "DESC";
}

export interface BaseRepositoryConfig<T> {
    /** Base URL path for the resource (e.g., '/products') */
    basePath: string;

    /** Zod schema for entity validation */
    entitySchema: ZodSchema<T>;
}

// ===========================================
// Response Schemas Factory
// ===========================================

/**
 * Create a paginated response schema for the given entity schema
 */
export function createPaginatedResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number(),
        page_number: z.number(),
        page_size: z.number(),
        count_items: z.number(),
        count_pages: z.number(),
        data: z.array(entitySchema),
        message: z.string(),
    });
}

/**
 * Create a single entity response schema
 */
export function createEntityResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number().optional(),
        data: entitySchema,
        message: z.string().optional(),
    });
}

/**
 * Create an array response schema
 */
export function createArrayResponseSchema<T>(entitySchema: ZodSchema<T>) {
    return z.object({
        status: z.number().optional(),
        data: z.array(entitySchema),
        message: z.string().optional(),
    });
}

// ===========================================
// Base Repository Factory
// ===========================================

/**
 * Create a base repository with common CRUD operations
 */
export function createBaseRepository<T>(config: BaseRepositoryConfig<T>) {
    const { basePath, entitySchema } = config;
    const pagedSchema = createPaginatedResponseSchema(entitySchema);
    const singleSchema = createEntityResponseSchema(entitySchema);

    return {
        /**
         * Get all entities
         */
        async getAll(): Promise<T[]> {
            const { data } = await httpClient.get(basePath);
            // Handle both array response and wrapped response
            if (Array.isArray(data)) {
                return z.array(entitySchema).parse(data);
            }
            const parsed = createArrayResponseSchema(entitySchema).parse(data);
            return parsed.data;
        },

        /**
         * Get entity by ID
         */
        async getById(id: string | number): Promise<T> {
            const { data } = await httpClient.get(`${basePath}/${id}`);
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Get paginated entities
         */
        async getPaged(
            params: PagingParams = {}
        ): Promise<PaginatedResponse<T>> {
            const {
                page = 0,
                size = 10,
                sortBy = "id",
                sortDirection = "DESC",
            } = params;

            const { data } = await httpClient.get(`${basePath}/paged`, {
                params: { page, size, sortBy, sortDirection },
            });

            const parsed = pagedSchema.parse(data);
            return parsed;
        },

        /**
         * Create a new entity
         */
        async create(payload: Partial<T>): Promise<T> {
            const { data } = await httpClient.post(basePath, payload);
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Update an existing entity
         */
        async update(id: string | number, payload: Partial<T>): Promise<T> {
            const { data } = await httpClient.put(`${basePath}/${id}`, payload);
            const parsed = singleSchema.parse(data);
            return parsed.data;
        },

        /**
         * Delete an entity
         */
        async delete(id: string | number): Promise<void> {
            await httpClient.delete(`${basePath}/${id}`);
        },

        /**
         * Get the base path for custom queries
         */
        getBasePath(): string {
            return basePath;
        },

        /**
         * Get the entity schema for custom validation
         */
        getEntitySchema(): ZodSchema<T> {
            return entitySchema;
        },
    };
}

// ===========================================
// Type Helpers
// ===========================================

export type BaseRepository<T> = ReturnType<typeof createBaseRepository<T>>;
