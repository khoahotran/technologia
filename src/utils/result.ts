/**
 * Kiểu dữ liệu Tuple theo phong cách Go: [Data | null, Error | null]
 */
export type GoResult<T, E = unknown> = [T, null] | [null, E];

/**
 * Pattern Go-style: Trả về một tuple [data, error]
 * Cách dùng: const [data, err] = await safe(promise);
 */
export async function safe<T, E = unknown>(
    promise: Promise<T>
): Promise<GoResult<T, E>> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error as unknown as E];
    }
}

/**
 * Pattern Go-style cho hàm đồng bộ (Synchronous)
 */
export function safeSync<T, E = unknown>(
    fn: () => T
): GoResult<T, E> {
    try {
        const data = fn();
        return [data, null];
    } catch (error) {
        return [null, error as unknown as E];
    }
}

