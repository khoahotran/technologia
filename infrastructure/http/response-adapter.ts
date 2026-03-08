/**
 * Response Adapter
 *
 * Transforms backend API responses to domain models
 * with automatic validation and error handling.
 *
 * Separates data transformation concerns from business logic,
 * making it easy to update one when API contracts change.
 *
 * This follows the Adapter pattern to bridge API contracts
 * with domain models.
 */

import { z, ZodSchema } from 'zod';

import { AppError, ValidationError } from '@/domain/errors';
import { createScopedLogger } from '@/lib/logger';
import type { DomainPaginatedResponse } from '@/shared/types';
import { safeSync } from '@/shared/utils/result';

const logger = createScopedLogger('ResponseAdapter');

// ===========================================
// Standard API Response Schema
// ===========================================

/**
 * All API responses follow this structure
 */
export const ApiResponseSchema = z.object({
  status: z.number().optional().default(200),
  message: z.string().optional().default('Success'),
  data: z.unknown(),
});


/**
 * Paginated list response structure (Matches actual API)
 */
export const PaginatedResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.array(z.unknown()),
  page_number: z.number(),
  page_size: z.number(),
  count_items: z.number(),
  count_pages: z.number(),
});

// ===========================================
// Response Adapter Functions
// ===========================================

/**
 * Xác thực và trích xuất dữ liệu từ một phản hồi API đơn lẻ
 *
 * @example
 * const product = adaptResponse(apiResponse, ProductSchema);
 */
export function adaptResponse<T extends ZodSchema>(
  data: unknown,
  schema: T,
  context?: string
): z.infer<T> {
  const [result, error] = safeSync(() => {
    // BƯỚC 1: Xác thực cấu trúc 'bọc' bên ngoài của API (status, message, data)
    const apiResponse = ApiResponseSchema.parse(data);

    // BƯỚC 2: Xác thực khối 'data' bên trong bằng Domain Schema cụ thể
    return schema.parse(apiResponse.data);
  });

  if (error) {
    // Tạo câu báo lỗi thân thiện nếu Zod phát hiện mismatch kiểu dữ liệu
    const message = error instanceof z.ZodError
      ? `Invalid response format${context ? ` for ${context}` : ''}: ${error.issues[0]?.message}`
      : 'Failed to parse response';

    logger.error(message, { context, data });

    // Ném ra ValidationError để ứng dụng xử lý (hiển thị popup/log)
    throw new ValidationError(message, {});
  }

  return result as z.infer<T>;
}

/**
 * Xác thực và trích xuất dữ liệu từ một phản hồi API có phân trang
 *
 * @example
 * const results = adaptPaginatedResponse(
 *   apiResponse,
 *   z.array(ProductSchema),
 *   'products'
 * );
 */
export function adaptPaginatedResponse<T extends ZodSchema>(
  data: unknown,
  itemSchema: T,
  context?: string
): DomainPaginatedResponse<z.infer<T>> {
  const [result, error] = safeSync(() => {
    // BƯỚC 1: Xác thực cấu trúc phân trang chuẩn của hệ thống
    const paginatedResponse = PaginatedResponseSchema.parse(data);

    // BƯỚC 2: Xác thực mảng các items bên trong
    const itemArray = z.array(itemSchema).parse(paginatedResponse.data);

    // Ánh xạ các trường từ snake_case của API sang camelCase của Domain model
    return {
      items: itemArray,
      pageNumber: paginatedResponse.page_number,
      pageSize: paginatedResponse.page_size,
      totalItems: paginatedResponse.count_items,
      totalPages: paginatedResponse.count_pages,
    };
  });

  if (error) {
    const message = error instanceof z.ZodError
      ? `Invalid paginated response${context ? ` for ${context}` : ''}: ${error.issues[0]?.message}`
      : 'Failed to parse paginated response';

    logger.error(message, { context, data });
    throw new ValidationError(message, {});
  }

  return result!;
}

/**
 * Xác thực và trích xuất danh sách dữ liệu (Hỗ trợ cả dạng bọc hoặc mảng trực tiếp)
 *
 * @example
 * const brands = adaptListResponse(apiResponse, BrandSchema, 'brands');
 */
export function adaptListResponse<T extends ZodSchema>(
  data: unknown,
  itemSchema: T,
  context?: string
): z.infer<T>[] {
  const [result, error] = safeSync(() => {
    // 1. Nếu là object bọc (ApiResponseSchema)
    if (data instanceof Object && 'status' in data && 'data' in data) {
      const apiResponse = ApiResponseSchema.parse(data);
      return z.array(itemSchema).parse(apiResponse.data);
    }

    // 2. Nếu là mảng trực tiếp
    if (Array.isArray(data)) {
      return z.array(itemSchema).parse(data);
    }

    throw new Error('Response is neither a wrapped API response nor a direct array');
  });

  if (error) {
    const message = error instanceof z.ZodError
      ? `Invalid list format${context ? ` for ${context}` : ''}: ${error.issues[0]?.message}`
      : `Failed to parse list response${context ? ` for ${context}` : ''}`;

    logger.error(message, { context, data, error });
    throw new ValidationError(message, {});
  }

  return result as z.infer<T>[];
}

/**
 * Adapt response to domain model with custom mapping function
 *
 * Useful when API field names don't match domain model
 *
 * @example
 * const product = adaptResponseWithMapper(
 *   apiResponse,
 *   (raw) => ({
 *     id: raw.product_id,
 *     name: raw.product_name,
 *     price: parseFloat(raw.price_str),
 *   })
 * );
 */
export function adaptResponseWithMapper<TOut>(
  data: unknown,
  mapper: (raw: unknown) => TOut,
  context?: string
): TOut {
  const [result, error] = safeSync(() => {
    const apiResponse = ApiResponseSchema.parse(data);
    return mapper(apiResponse.data);
  });

  if (error) {
    const message = error instanceof z.ZodError
      ? `Invalid response structure${context ? ` for ${context}` : ''}`
      : error instanceof Error
        ? error.message
        : 'Failed to adapt response';

    logger.error(message, { context });
    throw new AppError(message, 'ADAPTER_ERROR', 500, error);
  }

  return result as TOut;
}

/**
 * Safe response adaptation with fallback
 *
 * Returns null instead of throwing on validation failure
 * Useful for non-critical data
 *
 * @example
 * const metadata = safeAdapt(response, MetadataSchema);
 * if (metadata) {
 *   // use metadata
 * }
 */
export function safeAdapt<T extends ZodSchema>(
  data: unknown,
  schema: T,
  context?: string
): z.infer<T> | null {
  const [result, error] = safeSync(() => adaptResponse(data, schema, context));

  if (error) {
    logger.warn(`Failed to adapt response${context ? ` for ${context}` : ''}`);
    return null;
  }

  return result;
}

/**
 * Check if response is successful
 */
export function isSuccessResponse(data: unknown): boolean {
  const [response, error] = safeSync(() => ApiResponseSchema.parse(data));
  if (error) return false;
  return response!.status >= 200 && response!.status < 300;
}

/**
 * Extract data from wrapped API response
 * without validation (low-level utility)
 */
export function unwrapResponse(data: unknown): unknown {
  const [response, error] = safeSync(() => ApiResponseSchema.parse(data));
  if (error) return null;
  return response!.data;
}
