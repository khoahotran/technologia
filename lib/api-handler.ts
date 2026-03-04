/**
 * Nhà máy khởi tạo Trình xử lý API (API Handler Factory)
 * 
 * Bộ xử lý hợp nhất các Route API của Next.js đóng vai trò làm Proxy trung gian.
 * Có nhiệm vụ chuyển tiếp yêu cầu từ Frontend sang các Backend Services (Microservices).
 * 
 * Cách dùng:
 * export const GET = createApiHandler({ targetService: 'product', path: '/products' });
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SERVICE_URLS, HTTP_STATUS, REQUEST_CONFIG, COOKIE_NAMES } from '@/shared/constants';
import type { RouteContext } from '@/shared/types';

// ===========================================
// Khai báo Kiểu (Types)
// ===========================================

/** Danh sách các Microservices mục tiêu */
export type TargetService = 'product' | 'user' | 'payment' | 'cart';

/** Cấu hình cho một trình Handler */
export interface ApiHandlerConfig {
    /** Service Backend đích cần gọi tới */
    targetService: TargetService;

    /** Đường dẫn API (Ví dụ: '/products' hoặc hàm tạo đường dẫn '/products/:id') */
    path: string | ((params: Record<string, string>) => string);

    /** Endpoint này có bắt buộc phải Đăng nhập (Auth) không */
    requiresAuth?: boolean;

    /** Thời gian chờ tối đa (ms) */
    timeout?: number;

    /** Các Headers bổ sung nếu cần */
    headers?: Record<string, string>;
}

// ===========================================
// Bản đồ Ánh xạ URL Service (Service URL Mapping)
// ===========================================

const SERVICE_URL_MAP: Record<TargetService, string> = {
    product: SERVICE_URLS.PRODUCT_SERVICE,
    user: SERVICE_URLS.USER_SERVICE,
    payment: SERVICE_URLS.PAYMENT_SERVICE,
    cart: SERVICE_URLS.CART_SERVICE,
};

// ===========================================
// Các hàm Trợ giúp (Helper Functions)
// ===========================================

/**
 * Xây dựng URL đích hoàn chỉnh bao gồm Base URL, Path và Query Params.
 */
function buildTargetUrl(
    config: ApiHandlerConfig,
    req: Request,
    params?: Record<string, string>
): string {
    const baseUrl = SERVICE_URL_MAP[config.targetService];
    const path = typeof config.path === 'function'
        ? config.path(params || {})
        : config.path;

    // Lấy nguyên bản chuỗi Query (?key=val) từ request gốc của Client
    const { search } = new URL(req.url);

    return `${baseUrl}${path}${search}`;
}

/**
 * Xây dựng bộ Headers để gửi sang Backend
 * Tự động trích xuất Token từ Header của Client hoặc từ Cookie của Next.js
 */
async function buildHeaders(
    req: Request,
    config: ApiHandlerConfig
): Promise<HeadersInit> {
    const headers: Record<string, string> = {
        'Content-Type': REQUEST_CONFIG.JSON_CONTENT_TYPE,
    };

    // Ưu tiên lấy Authorization từ Header mà Client gửi lên Proxy
    let authHeader = req.headers.get('Authorization');

    // Nếu không có trong Header, thử tìm trong hệ thống Cookie của trình duyệt (SSR context)
    if (!authHeader) {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
        if (token) {
            authHeader = `Bearer ${token}`;
        }
    }

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    // Gộp thêm các header tùy chỉnh từ config
    if (config.headers) {
        Object.assign(headers, config.headers);
    }

    return headers;
}

/**
 * Trích xuất Body của request (dùng cho POST, PUT, PATCH)
 */
async function getRequestBody(req: Request): Promise<ArrayBuffer | null> {
    if (['GET', 'HEAD'].includes(req.method)) {
        return null;
    }

    try {
        return await req.arrayBuffer();
    } catch {
        return null;
    }
}

/**
 * Giải mã phản hồi JSON từ Backend
 */
async function parseResponse(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        // Fallback về object rỗng nếu Backend ko trả JSON hợp lệ
        return {};
    }
}

// ===========================================
// Nhà máy khởi tạo API Handler (Factory)
// ===========================================

/**
 * Khởi tạo một Handler cho các Route tĩnh (Route ko chứa biến động trên URL)
 */
export function createApiHandler(config: ApiHandlerConfig) {
    return async function handler(req: Request): Promise<NextResponse> {
        try {
            const targetUrl = buildTargetUrl(config, req);
            const headers = await buildHeaders(req, config);
            const body = await getRequestBody(req);

            // Thực hiện chuyển tiếp (Forward) request sang Backend thực sự
            const res = await fetch(targetUrl, {
                method: req.method,
                headers,
                body,
            });

            const data = await parseResponse(res);

            // Nếu Backend báo lỗi (4xx, 5xx) -> Trả lỗi về cho Client
            if (!res.ok) {
                const errorData = data as { message?: string };
                return NextResponse.json(
                    { error: errorData.message || `Lỗi từ Proxy: ${res.statusText}` },
                    { status: res.status }
                );
            }

            // Thành công -> Trả dữ liệu về Client
            return NextResponse.json(data);
        } catch (error) {
            console.error('[API Proxy] Lỗi Nội bộ:', error);
            return NextResponse.json(
                { error: 'Lỗi máy chủ nội bộ (Internal Server Error)' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }
    };
}

/**
 * Khởi tạo Handler cho các Route Động (Ví dụ: /products/[id])
 */
export function createDynamicApiHandler<T extends Record<string, string> = Record<string, string>>(
    config: Omit<ApiHandlerConfig, 'path'> & {
        path: (params: T) => string;
    }
) {
    return async function handler(
        req: Request,
        context: RouteContext<T>
    ): Promise<NextResponse> {
        try {
            // Đợi lấy params từ Next.js Route context
            const params = await context.params;
            const targetUrl = buildTargetUrl(config as ApiHandlerConfig, req, params);
            const headers = await buildHeaders(req, config as ApiHandlerConfig);
            const body = await getRequestBody(req);

            const res = await fetch(targetUrl, {
                method: req.method,
                headers,
                body,
            });

            const data = await parseResponse(res);

            if (!res.ok) {
                const errorData = data as { message?: string };
                return NextResponse.json(
                    { error: errorData.message || `Lỗi từ Proxy Động: ${res.statusText}` },
                    { status: res.status }
                );
            }

            return NextResponse.json(data);
        } catch (error) {
            console.error('[API Proxy - Dynamic] Lỗi Nội bộ:', error);
            return NextResponse.json(
                { error: 'Lỗi máy chủ nội bộ' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }
    };
}

// ===========================================
// Các trình Handler được Cấu hình sẵn (Presets)
// ===========================================

/**
 * Khởi tạo nhanh bộ Handler cho một tài nguyên CRUD đầy đủ.
 */
export function createResourceHandlers(
    service: TargetService,
    basePath: string
) {
    return {
        // Lấy danh sách: GET /[basePath]
        list: createApiHandler({
            targetService: service,
            path: basePath,
        }),

        // Lấy chi tiết: GET /[basePath]/:id
        getById: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
        }),

        // Tạo mới: POST /[basePath]
        create: createApiHandler({
            targetService: service,
            path: basePath,
            requiresAuth: true,
        }),

        // Cập nhật: PUT /[basePath]/:id
        update: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
            requiresAuth: true,
        }),

        // Xóa: DELETE /[basePath]/:id
        delete: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
            requiresAuth: true,
        }),
    };
}
