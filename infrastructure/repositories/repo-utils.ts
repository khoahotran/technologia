import { ZodType } from "zod";

import { createScopedLogger } from "@/lib/logger";
import { safeSync } from "@/shared/utils/result";

const logger = createScopedLogger('RepoUtils');

/**
 * Interface standard cho phản hồi phân trang
 */
export interface PaginatedResponse<T> {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: T[];
    message: string;
}

/**
 * Hàm hỗ trợ parse và normalize phản hồi phân trang từ API
 */
export function parsePaginatedResponse<TInput, TOutput>(
    response: unknown,
    schema: ZodType<PaginatedResponse<TInput>>,
    normalizer: (item: TInput) => TOutput
): PaginatedResponse<TOutput> {
    const [validated, error] = safeSync(() => schema.parse(response));

    if (error) {
        logger.error('Failed to parse paginated response', error);
        throw error;
    }

    const result = validated!;

    return {
        status: result.status,
        page_number: result.page_number,
        page_size: result.page_size,
        count_items: result.count_items,
        count_pages: result.count_pages,
        data: result.data.map(normalizer),
        message: result.message,
    };
}
