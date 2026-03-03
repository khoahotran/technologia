/**
 * API Handler Factory
 * Unified handler for Next.js API routes that proxy to backend services
 * 
 * Usage:
 * export const GET = createApiHandler({ targetService: 'product', path: '/products' });
 */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SERVICE_URLS, HTTP_STATUS, REQUEST_CONFIG, COOKIE_NAMES } from '@/shared/constants';
import type { RouteContext } from '@/shared/types';

// ===========================================
// Types
// ===========================================

export type TargetService = 'product' | 'user' | 'payment' | 'cart';

export interface ApiHandlerConfig {
    /** Target backend service */
    targetService: TargetService;

    /** API path (e.g., '/products' or '/products/:id') */
    path: string | ((params: Record<string, string>) => string);

    /** Whether this endpoint requires authentication */
    requiresAuth?: boolean;

    /** Custom timeout in ms */
    timeout?: number;

    /** Additional headers to send */
    headers?: Record<string, string>;
}

// ===========================================
// Service URL Mapping
// ===========================================

const SERVICE_URL_MAP: Record<TargetService, string> = {
    product: SERVICE_URLS.PRODUCT_SERVICE,
    user: SERVICE_URLS.USER_SERVICE,
    payment: SERVICE_URLS.PAYMENT_SERVICE,
    cart: SERVICE_URLS.CART_SERVICE,
};

// ===========================================
// Helper Functions
// ===========================================

/**
 * Build target URL from config and request
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

    // Get query params from original request
    const { search } = new URL(req.url);

    return `${baseUrl}${path}${search}`;
}

/**
 * Build headers for proxy request
 */
async function buildHeaders(
    req: Request,
    config: ApiHandlerConfig
): Promise<HeadersInit> {
    // Debug: Log all incoming headers
    const incomingHeaders: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        incomingHeaders[key] = key.toLowerCase() === 'authorization' ? `${value.substring(0, 15)}...` : value;
    });
    console.warn(`[API Proxy] Incoming Headers:`, incomingHeaders);

    const headers: Record<string, string> = {
        'Content-Type': REQUEST_CONFIG.JSON_CONTENT_TYPE,
    };

    // Forward auth header if present
    let authHeader = req.headers.get('Authorization');
    let source = 'NONE';

    // Fallback to cookie if no Authorization header
    if (!authHeader) {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
        if (token) {
            authHeader = `Bearer ${token}`;
            source = 'COOKIE';
        }
    } else {
        source = 'HEADER';
    }

    if (authHeader) {
        headers['Authorization'] = authHeader;
        console.warn(`[API Proxy] Auth token sourced from: ${source} (starts with: ${authHeader.substring(0, 15)}...)`);
    } else {
        console.warn(`[API Proxy] No auth token found in headers or cookies`);
    }

    // Add custom headers from config
    if (config.headers) {
        Object.assign(headers, config.headers);
    }

    return headers;
}

/**
 * Get request body for non-GET methods
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
 * Parse and normalize response
 */
async function parseResponse(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        return {};
    }
}

// ===========================================
// API Handler Factory
// ===========================================

/**
 * Create a handler for simple routes (no dynamic params)
 */
export function createApiHandler(config: ApiHandlerConfig) {
    return async function handler(req: Request): Promise<NextResponse> {
        try {
            const targetUrl = buildTargetUrl(config, req);
            const headers = await buildHeaders(req, config);
            const body = await getRequestBody(req);

            console.warn(`[API Proxy] ${req.method} ${targetUrl} (Body size: ${body?.byteLength || 0} bytes)`);

            // Debug: Log all headers being sent
            Object.entries(headers).forEach(([key, value]) => {
                const displayValue = key.toLowerCase() === 'authorization'
                    ? `${value.substring(0, 15)}...`
                    : value;
                console.warn(`[API Proxy] Header: ${key}=${displayValue}`);
            });

            const res = await fetch(targetUrl, {
                method: req.method,
                headers,
                body,
            });

            const data = await parseResponse(res);

            // Debug: log response status from backend
            console.warn(`[API Proxy] Backend Response: ${res.status}`, JSON.stringify(data));

            if (!res.ok) {
                const errorData = data as { message?: string };
                return NextResponse.json(
                    { error: errorData.message || `Proxy Error: ${res.statusText}`, details: data },
                    { status: res.status }
                );
            }

            return NextResponse.json(data);
        } catch (error) {
            console.error('[API Proxy] Internal Error:', error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }
    };
}

/**
 * Create a handler for routes with dynamic params (e.g., /products/[id])
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
            const params = await context.params;
            const targetUrl = buildTargetUrl(config as ApiHandlerConfig, req, params);
            const headers = await buildHeaders(req, config as ApiHandlerConfig);
            const body = await getRequestBody(req);

            console.warn(`[API Proxy] ${req.method} ${targetUrl} (Body size: ${body?.byteLength || 0} bytes)`);

            // Debug: Log all headers being sent
            Object.entries(headers).forEach(([key, value]) => {
                const displayValue = key.toLowerCase() === 'authorization'
                    ? `${value.substring(0, 15)}...`
                    : value;
                console.warn(`[API Proxy] Header: ${key}=${displayValue}`);
            });

            const res = await fetch(targetUrl, {
                method: req.method,
                headers,
                body,
            });

            const data = await parseResponse(res);

            // Debug: log response status from backend
            console.warn(`[API Proxy - Dynamic] Backend Response: ${res.status}`, JSON.stringify(data));

            if (!res.ok) {
                const errorData = data as { message?: string };
                console.error(`[API Proxy - Dynamic] Backend Error Details:`, errorData);
                return NextResponse.json(
                    { error: errorData.message || `Proxy Error: ${res.statusText}`, details: data },
                    { status: res.status }
                );
            }

            return NextResponse.json(data);
        } catch (error) {
            console.error('[API Proxy - Dynamic] Internal Error:', error);
            return NextResponse.json(
                { error: 'Internal Server Error' },
                { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
            );
        }
    };
}

// ===========================================
// Pre-configured Handlers
// ===========================================

/**
 * Create handlers for a complete CRUD resource
 */
export function createResourceHandlers(
    service: TargetService,
    basePath: string
) {
    return {
        // GET /resource
        list: createApiHandler({
            targetService: service,
            path: basePath,
        }),

        // GET /resource/:id
        getById: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
        }),

        // POST /resource
        create: createApiHandler({
            targetService: service,
            path: basePath,
            requiresAuth: true,
        }),

        // PUT /resource/:id
        update: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
            requiresAuth: true,
        }),

        // DELETE /resource/:id
        delete: createDynamicApiHandler<{ id: string }>({
            targetService: service,
            path: ({ id }) => `${basePath}/${id}`,
            requiresAuth: true,
        }),
    };
}
