import { cookies } from "next/headers";

import { COOKIE_NAMES, REQUEST_CONFIG } from "@/shared/constants";
import { safe } from "@/shared/utils/result";

/**
 * Giải mã JSON an toàn (ko gây crash nếu Backend trả về chuỗi ko phải JSON)
 */
export async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
    const [json, error] = await safe(res.json());
    if (error) {
        return {};
    }
    if (json && typeof json === "object") {
        return json as Record<string, unknown>;
    }
    return {};
}

/**
 * Trích xuất Token xác thực từ Header hoặc Cookie của Request hiện tại.
 */
export async function getAuthToken(request: Request): Promise<string | null> {
    // 1. Thử lấy từ Authorization header (dành cho client gửi trực tiếp)
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const masked = authHeader.substring(0, 15) + "...";
        console.warn(`[PROXY AUTH] Token found in HEADER: ${masked}`);
        return authHeader;
    }

    // 2. Dự phòng lấy từ Cookie (dành cho các thao tác SSR hoặc trình duyệt tự gửi)
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
    if (token) {
        const masked = `Bearer ${token.substring(0, 15)}...`;
        console.warn(`[PROXY AUTH] Token found in COOKIE: ${masked}`);
        return `Bearer ${token}`;
    }

    console.warn(`[PROXY AUTH] NO TOKEN FOUND for request to: ${request.url}`);
    return null;

}

/**
 * Trợ giúp phân tích thông báo lỗi từ dữ liệu phản hồi của Backend
 */
export function parseErrorMessage(data: unknown, fallbackError: string): string {
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
        return data.message;
    }
    return fallbackError;
}

/**
 * Xây dựng bộ Headers để gửi sang Backend
 */
export async function buildHeaders(
    req: Request,
    customHeaders?: Record<string, string>
): Promise<HeadersInit> {
    const headers: Record<string, string> = {
        'Content-Type': REQUEST_CONFIG.JSON_CONTENT_TYPE,
    };

    const authHeader = await getAuthToken(req);
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    if (customHeaders) {
        Object.assign(headers, customHeaders);
    }

    return headers;
}
