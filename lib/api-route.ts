/**
 * Tiện ích Route API cho Next.js (API Route Utilities)
 * 
 * Cung cấp các hàm bổ trợ cho các Route API trong thư mục app/api.
 * Chuyên biệt phục vụ việc chuyển tiếp yêu cầu (Proxy) sang User Service và quản lý Cookies.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthToken as getAuthTokenUtil, parseErrorMessage, parseJsonSafe } from "./api-utils";

import { COOKIE_NAMES, HTTP_STATUS, SERVICE_URLS } from "@/shared/constants";
import { safe } from "@/shared/utils/result";

type JsonRecord = Record<string, unknown>;

/** 
 * Các cấu hình tùy chọn khi chuyển tiếp yêu cầu JSON sang User Service 
 */
interface ForwardToUserServiceOptions {
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: JsonRecord;
    authHeader?: string;
    fallbackError: string;
    logLabel: string;
    mapSuccess?: (data: JsonRecord) => JsonRecord;
}

/** 
 * Các cấu hình tùy chọn khi chuyển tiếp yêu cầu Form Data (Upload file) 
 */
interface ForwardFormDataOptions {
    path: string;
    method: "PUT" | "POST" | "PATCH";
    formData: FormData;
    authHeader?: string;
    fallbackError: string;
    logLabel: string;
}

/**
 * Trích xuất Token xác thực từ Header hoặc Cookie của Request hiện tại.
 */
export async function getAuthToken(request: Request): Promise<string | null> {
    return getAuthTokenUtil(request);
}

/**
 * Kiểm tra bắt buộc phải có Authorization Header, nếu ko có -> Trả về phản hồi 401.
 */
export function requireAuthorizationHeader(request: Request): string | NextResponse {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Yêu cầu Header Authorization (Bearer token)" },
            { status: HTTP_STATUS.UNAUTHORIZED }
        );
    }

    return authHeader;
}

/**
 * Thiết lập Access Token vào Cookie của trình duyệt (Dùng sau khi Login/Refresh thành công).
 * Cookie được đánh dấu httpOnly và secure để đảm bảo an toàn.
 */
export async function setAccessTokenCookie(accessToken: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
        httpOnly: true, // Chống XSS truy cập token
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // Hết hạn sau 7 ngày
    });
}

/**
 * Chuyển tiếp yêu cầu dạng JSON sang User Service.
 */
export async function forwardJsonToUserService(options: ForwardToUserServiceOptions): Promise<NextResponse> {
    const { path, method, body, authHeader, fallbackError, logLabel, mapSuccess } = options;

    const [backendRes, error] = await safe(fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    }));

    if (error) {
        console.error(`${logLabel} Proxy Error:`, error);
        return NextResponse.json(
            { error: "Lỗi kết nối máy chủ dịch vụ" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }

    const data = await parseJsonSafe(backendRes!);

    if (!backendRes!.ok) {
        return NextResponse.json(
            { error: parseErrorMessage(data, fallbackError) },
            { status: backendRes!.status }
        );
    }

    // Trả kết quả thành công, có thể chạy qua hàm mapSuccess để biến đổi dữ liệu trước khi về Client
    return NextResponse.json(mapSuccess ? mapSuccess(data) : data);
}

/**
 * Chuyển tiếp yêu cầu dạng Form Data (thường dùng để Upload ảnh đại diện) sang User Service.
 */
export async function forwardFormDataToUserService(options: ForwardFormDataOptions): Promise<NextResponse> {
    const { path, method, formData, authHeader, fallbackError, logLabel } = options;

    const [backendRes, error] = await safe(fetch(`${SERVICE_URLS.USER_SERVICE}${path}`, {
        method,
        headers: {
            // Lưu ý: Ko set Content-Type khi gửi FormData để Fetch tự generate Boundary
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: formData,
    }));

    if (error) {
        console.error(`${logLabel} Proxy Error:`, error);
        return NextResponse.json(
            { error: "Lỗi kết nối máy chủ dịch vụ" },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }

    const data = await parseJsonSafe(backendRes!);

    if (!backendRes!.ok) {
        return NextResponse.json(
            { error: parseErrorMessage(data, fallbackError) },
            { status: backendRes!.status }
        );
    }

    return NextResponse.json(data);
}
