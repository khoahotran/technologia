/**
 * Nhà máy khởi tạo Trình xử lý API (API Handler Factory)
 * 
 * Bộ xử lý hợp nhất các Route API của Next.js đóng vai trò làm Proxy trung gian.
 * Có nhiệm vụ chuyển tiếp yêu cầu từ Frontend sang các Backend Services (Microservices).
 * 
 * Cách dùng:
 * export const GET = createApiHandler({ targetService: 'product', path: '/products' });
 */
import { NextResponse } from 'next/server';

import { buildHeaders, parseJsonSafe } from './api-utils';

import { SERVICE_URLS, HTTP_STATUS } from '@/constants';
import type { RouteContext } from '@/types';
import { safe } from '@/utils/result';

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
 * Trích xuất Body của request (dùng cho POST, PUT, PATCH)
 */
async function getRequestBody(req: Request): Promise<ArrayBuffer | null> {
    if (['GET', 'HEAD'].includes(req.method)) {
        return null;
    }

    const [buffer, error] = await safe(req.arrayBuffer());
    if (error) {
        return null;
    }
    return buffer as ArrayBuffer;
}

// ===========================================
// Nhà máy khởi tạo API Handler (Factory)
// ===========================================

export function createApiHandler(config: ApiHandlerConfig) {
    return async function handler(req: Request): Promise<NextResponse> {
        const [result, error] = await safe((async () => {
            const targetUrl = buildTargetUrl(config, req);
            const headers = await buildHeaders(req, config.headers);
            const body = await getRequestBody(req);

            const headersObj = headers as Record<string, string>;
            const authHeader = headersObj['Authorization'];

            // DEBUG LOGS
            console.warn(`[PROXY DEBUG] Forwarding ${req.method} to: ${targetUrl}`);

            if (authHeader) {
                const masked = authHeader.substring(0, 20) + '...';
                console.warn(`[PROXY DEBUG] Authorization: ${masked}`);

                try {
                    const token = authHeader.replace('Bearer ', '');
                    const parts = token.split('.');
                    if (parts.length === 3 && parts[1]) {
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                        const now = Math.floor(Date.now() / 1000);
                        console.warn(`[PROXY DEBUG] JWT Details - Sub: ${payload.sub}, Role: ${payload.role}, Exp in: ${payload.exp - now}s`);

                        // HỖ TRỢ MICROSERVICES: Tự động trích xuất userId từ token và gắn vào header X-User-Id
                        // Nhiều microservices mong đợi header này nếu không muốn tự decode JWT lại.
                        const userId = payload.userId || payload.sub;
                        if (userId) {
                            headersObj['X-User-Id'] = String(userId);
                            console.warn(`[PROXY DEBUG] Added header X-User-Id: ${userId}`);
                        }
                    }
                } catch {
                    // Ignore parsing errors for non-JWT tokens
                }
            }

            // Thực hiện chuyển tiếp (Forward) request sang Backend thực sự
            const res = await fetch(targetUrl, {
                method: req.method,
                headers: headersObj as unknown as HeadersInit,
                body,
            });

            const data = await parseJsonSafe(res);

            // Nếu Backend báo lỗi (4xx, 5xx) -> Trả lỗi về cho Client
            if (!res.ok) {
                const errorData = data as { message?: string, error?: string };
                console.warn(`[PROXY ERROR] Backend responded with ${res.status}:`, errorData);
                return NextResponse.json(
                    {
                        error: errorData.message || errorData.error || `Lỗi từ Backend: ${res.statusText}`,
                        statusCode: res.status // Gắn status code để frontend dễ xử lý logic 401/403
                    },
                    { status: res.status }
                );
            }

            // Thành công -> Trả dữ liệu về Client
            return NextResponse.json(data);
        })());

        if (error) {
            console.error('[API Proxy] Lỗi Nội bộ:', error);
            return NextResponse.json(
                { error: 'Lỗi máy chủ nội bộ (Internal Server Error)' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }

        return result as NextResponse;
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
        const [result, error] = await safe((async () => {
            // Đợi lấy params từ Next.js Route context
            const params = await context.params;
            const targetUrl = buildTargetUrl(config as ApiHandlerConfig, req, params);
            const headers = await buildHeaders(req, config.headers);
            const body = await getRequestBody(req);

            const res = await fetch(targetUrl, {
                method: req.method,
                headers,
                body,
            });

            const data = await parseJsonSafe(res);

            if (!res.ok) {
                const errorData = data as { message?: string };
                return NextResponse.json(
                    { error: errorData.message || `Lỗi từ Proxy Động: ${res.statusText}` },
                    { status: res.status }
                );
            }

            return NextResponse.json(data);
        })());

        if (error) {
            console.error('[API Proxy - Dynamic] Lỗi Nội bộ:', error);
            return NextResponse.json(
                { error: 'Lỗi máy chủ nội bộ' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }

        return result as NextResponse;
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

