/**
 * Request Adapter
 *
 * Transforms domain/application models to backend API request format
 * ensuring API contracts are never violated.
 *
 * If API expects snake_case but domain uses camelCase,
 * the adapter handles the transformation consistently.
 */

import { createScopedLogger } from '@/lib/logger';
import { safeSync } from '@/shared/utils/result';

const logger = createScopedLogger('RequestAdapter');

// ===========================================
// Types
// ===========================================

export interface RequestAdapterOptions {
  /** Convert field names (camelCase → snake_case) */
  transformKeys?: boolean;

  /** Omit undefined/null values */
  omitEmpty?: boolean;

  /** Custom field mapping */
  fieldMap?: Record<string, string>;

  /** Custom transformer function */
  transform?: (data: unknown) => unknown;
}

// ===========================================
// Utility Functions
// ===========================================

/**
 * Chuyển đổi tên trường từ camelCase sang snake_case
 * Ví dụ: productName -> product_name
 */
function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Đệ quy chuyển đổi toàn bộ Key của object sang snake_case
 */
function transformObjectKeys(
  obj: unknown,
  fieldMap?: Record<string, string>
): unknown {
  // Nếu không phải object hoặc là null, trả về giá trị gốc (điểm dừng đệ quy)
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Nếu là mảng, thực hiện map đệ quy cho từng item
  if (Array.isArray(obj)) {
    return obj.map(item => transformObjectKeys(item, fieldMap));
  }

  const transformed: Record<string, unknown> = {};

  // Duyệt qua từng cặp key-value trong object
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Ưu tiên dùng fieldMap thủ công nếu có, nếu không tiến hành convert tự động
    const mappedKey = fieldMap?.[key] || camelToSnakeCase(key);

    // Nếu value là object hoặc mảng, tiếp tục đệ quy sâu hơn
    transformed[mappedKey] = Array.isArray(value) || (value && typeof value === 'object')
      ? transformObjectKeys(value, fieldMap)
      : value;
  }

  return transformed;
}

/**
 * Loại bỏ các giá trị rỗng/không xác định trong object để giảm size payload gửi lên API
 */
function omitEmpty(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(omitEmpty);
  }

  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Chỉ giữ lại những trường có giá trị thực tế
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = omitEmpty(value);
    }
  }

  return cleaned;
}

// ===========================================
// Main Adapter Functions
// ===========================================

/**
 * Adapt domain object to API request format
 *
 * @example
 * const apiRequest = adaptRequest(
 *   { keyword: 'shoes', minPrice: 10, maxPrice: 100 },
 *   { transformKeys: true, omitEmpty: true }
 * );
 * // Result: { keyword: 'shoes', min_price: 10, max_price: 100 }
 */
export function adaptRequest(
  data: unknown,
  options: RequestAdapterOptions = {}
): unknown {
  const {
    transformKeys = false,
    omitEmpty: omitEmptyValues = true,
    fieldMap,
    transform,
  } = options;

  const [adaptedData, error] = safeSync(() => {
    let adapted = data;

    // Custom transformer first
    if (transform) {
      adapted = transform(adapted);
    }

    // Remove empty values
    if (omitEmptyValues) {
      adapted = omitEmpty(adapted);
    }

    // Transform keys
    if (transformKeys) {
      adapted = transformObjectKeys(adapted, fieldMap);
    }

    logger.debug('Request adapted', { original: data, adapted });
    return adapted;
  });

  if (error !== null) {
    logger.error('Failed to adapt request', { data, options, error });
    throw error;
  }

  return adaptedData;
}

/**
 * Adapt search parameters for URL query string
 *
 * Ensures consistent handling of pagination, sorting, filtering params
 *
 * @example
 * const params = adaptSearchParams({
 *   page: 0,
 *   size: 20,
 *   sortBy: 'createdAt',
 *   sortDirection: 'DESC',
 *   keyword: undefined,
 * });
 */
export function adaptSearchParams(params: Record<string, unknown>): Record<string, unknown> {
  return adaptRequest(params, {
    transformKeys: true,
    omitEmpty: true,
    fieldMap: {
      'page': 'page',
      'size': 'size',
      'sortBy': 'sort_by',
      'sortDirection': 'sort_direction',
      'keyword': 'keyword',
    },
  }) as Record<string, unknown>;
}

/**
 * Adapter for product search request
 *
 * Maps domain ProductSearchParams to API query format
 */
export function adaptProductSearchParams(params: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  categoryId?: number;
  brandId?: number;
}): Record<string, unknown> {
  return adaptRequest(params, {
    transformKeys: true,
    omitEmpty: true,
  }) as Record<string, unknown>;
}

/**
 * Adapter for pagination params
 *
 * Normalizes page/size parameters consistent with backend expectations
 */
export function adaptPaginationParams(params: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}): Record<string, unknown> {
  return {
    page: params.page ?? 0,
    size: params.size ?? 10,
    sort_by: params.sortBy ?? 'created_at',
    sort_direction: params.sortDirection ?? 'DESC',
  };
}

// ===========================================
// Type-Safe Adapter Factory
// ===========================================

/**
 * Create a custom adapter for specific request type
 *
 * @example
 * const adapter = createRequestAdapter<ProductCreateRequest>({
 *   transformKeys: true,
 *   fieldMap: {
 *     'productName': 'name',
 *     'productDescription': 'description',
 *   },
 * });
 *
 * const apiRequest = adapter({ productName: 'Nike Shoes', ... });
 */
export function createRequestAdapter<T>(
  options: RequestAdapterOptions
) {
  return (data: T): unknown => adaptRequest(data, options);
}

// ===========================================
// Batch Adaptation
// ===========================================

/**
 * Adapt multiple requests efficiently
 *
 * @example
 * const [searchParams, sortParams] = adaptRequests(
 *   [searchInput, sortInput],
 *   { transformKeys: true }
 * );
 */
export function adaptRequests(
  data: unknown[],
  options: RequestAdapterOptions = {}
): unknown[] {
  return data.map(item => adaptRequest(item, options));
}
