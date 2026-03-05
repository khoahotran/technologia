/**
 * Storage Service
 *
 * SSR-safe storage abstraction supporting:
 * - localStorage (client-side)
 * - cookies (both client and server)
 * - Memory fallback (SSR)
 *
 * @example
 * // Auto-selects best storage based on environment
 * storage.set('user_preferences', { theme: 'dark' });
 * const prefs = storage.get<UserPrefs>('user_preferences');
 */

import { STORAGE_KEYS } from "@/shared/constants";
import { safeSync } from "@/shared/utils/result";

// ===========================================
// Types
// ===========================================

export type StorageType = "local" | "session" | "cookie" | "memory";

export interface StorageOptions {
    /** Storage type to use */
    type?: StorageType;
    /** Cookie-specific: expiry in days */
    expireDays?: number;
    /** Cookie-specific: path */
    path?: string;
    /** Cookie-specific: secure flag */
    secure?: boolean;
    /** Cookie-specific: sameSite */
    sameSite?: "strict" | "lax" | "none";
}

// ===========================================
// Memory Storage (SSR fallback)
// ===========================================

const memoryStorage = new Map<string, string>();

// ===========================================
// Helpers
// ===========================================

function isClient(): boolean {
    return typeof window !== "undefined";
}

function isCookieAvailable(): boolean {
    return typeof document !== "undefined" && document.cookie !== undefined;
}

// ===========================================
// Cookie Operations
// ===========================================

function setCookie(
    name: string,
    value: string,
    options: StorageOptions = {}
): void {
    if (!isCookieAvailable()) return;

    const {
        expireDays = 7,
        path = "/",
        secure = process.env.NODE_ENV === "production",
        sameSite = "lax",
    } = options;

    const expires = new Date();
    expires.setTime(expires.getTime() + expireDays * 24 * 60 * 60 * 1000);

    const cookieParts = [
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
        `expires=${expires.toUTCString()}`,
        `path=${path}`,
        `SameSite=${sameSite}`,
    ];

    if (secure) {
        cookieParts.push("Secure");
    }

    document.cookie = cookieParts.join("; ");
}

function getCookie(name: string): string | null {
    if (!isCookieAvailable()) return null;

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const c = cookie.trim();
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

function deleteCookie(name: string, path: string = "/"): void {
    if (!isCookieAvailable()) return;
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}

// ===========================================
// Storage Class
// ===========================================

/**
 * Dịch vụ Lưu trữ (Storage Service)
 *
 * Một lớp trừu tượng hóa việc lưu trữ dữ liệu, hỗ trợ đa môi trường (SSR safe):
 * - localStorage (Client-side, tồn tại lâu dài)
 * - sessionStorage (Client-side, theo phiên làm việc)
 * - cookies (Cả Client và Server, dùng cho Auth/Middleware)
 * - Memory fallback (Dùng tạm trong bộ nhớ nếu chạy trên Server Node.js)
 */

class StorageService {
    /** Loại hình lưu trữ mặc định nếu không chỉ định */
    private defaultType: StorageType;

    constructor(defaultType: StorageType = "local") {
        this.defaultType = defaultType;
    }

    /**
     * Trích xuất Engine lưu trữ tương ứng của trình duyệt
     */
    private getStorage(type: StorageType): Storage | null {
        // Trả về null nếu đang ở môi trường Server (không có đối tượng window)
        if (!isClient()) return null;

        switch (type) {
            case "local":
                return window.localStorage;
            case "session":
                return window.sessionStorage;
            default:
                return null;
        }
    }

    /**
     * Lưu giá trị vào bộ nhớ
     * @param key Khóa định danh
     * @param value Giá trị (Object/Array sẽ được tự động stringify)
     * @param options Cấu hình loại storage và cookie attributes
     */
    set<T>(key: string, value: T, options: StorageOptions = {}): void {
        const type = options.type ?? this.defaultType;
        // Chuyển đổi dữ liệu sang chuỗi JSON để lưu trữ đơn giản
        const serialized = typeof value === "string" ? value : JSON.stringify(value);

        // Xử lý riêng cho Cookie (Cần set thủ công qua document.cookie)
        if (type === "cookie") {
            setCookie(key, serialized, options);
            return;
        }

        // Nếu là Memory Storage hoặc đang ở Server, chỉ lưu vào Map biến tĩnh
        if (type === "memory" || !isClient()) {
            memoryStorage.set(key, serialized);
            return;
        }

        const storage = this.getStorage(type);
        if (storage) {
            const [, error] = safeSync(() => storage.setItem(key, serialized));
            if (error) {
                // Fallback sang bộ nhớ RAM nếu ổ đĩa/quota trình duyệt bị đầy
                memoryStorage.set(key, serialized);
            }
        }
    }

    /**
     * Lấy giá trị từ bộ nhớ
     */
    get<T>(key: string, options: StorageOptions = {}): T | null {
        const type = options.type ?? this.defaultType;

        let value: string | null = null;

        // Ưu tiên đọc từ nguồn tương ứng
        if (type === "cookie") {
            value = getCookie(key);
        } else if (type === "memory" || !isClient()) {
            value = memoryStorage.get(key) ?? null;
        } else {
            const storage = this.getStorage(type);
            if (storage) {
                value = storage.getItem(key);
            }
        }

        if (value === null) return null;

        // Tối ưu việc Parsing: Chỉ gọi JSON.parse nếu chuỗi có dấu hiệu là Object/Array/Boolean
        if (
            typeof value === "string" &&
            (value.startsWith("{") ||
                value.startsWith("[") ||
                value === "true" ||
                value === "false" ||
                (value.startsWith("\"") && value.endsWith("\"")))
        ) {
            const [parsed, error] = safeSync(() => JSON.parse(value!) as T);
            if (error !== null) {
                return value as unknown as T;
            }
            return parsed;
        }

        // Trả về chuỗi gốc nếu không cần parse
        return value as unknown as T;
    }

    /** Xóa bỏ một khóa khỏi bộ nhớ */
    remove(key: string, options: StorageOptions = {}): void {
        const type = options.type ?? this.defaultType;

        if (type === "cookie") {
            deleteCookie(key, options.path);
            return;
        }

        if (type === "memory" || !isClient()) {
            memoryStorage.delete(key);
            return;
        }

        const storage = this.getStorage(type);
        if (storage) {
            storage.removeItem(key);
        }
    }

    /** Kiểm tra xem một khóa có tồn tại hay không */
    has(key: string, options: StorageOptions = {}): boolean {
        return this.get(key, options) !== null;
    }

    /** Xóa sạch sành sanh toàn bộ dữ liệu trong Storage chỉ định */
    clear(type?: StorageType): void {
        const targetType = type ?? this.defaultType;

        if (targetType === "memory") {
            memoryStorage.clear();
            return;
        }

        if (!isClient()) return;

        const storage = this.getStorage(targetType);
        if (storage) {
            storage.clear();
        }
    }
}

// ===========================================
// Singleton Instances - Các instance dùng sẵn cho toàn ứng dụng
// ===========================================

/** Storage mặc định (localStorage) */
export const storage = new StorageService("local");

/** Storage theo phiên (sessionStorage) */
export const sessionStorage = new StorageService("session");

/** Storage dạng Cookie */
export const cookieStorage = new StorageService("cookie");

// ===========================================
// Auth Token Helpers - Các tiện ích chuyên biệt cho Authentication
// ===========================================

/**
 * Đối tượng chuyên trách quản lý Access Token và Refresh Token.
 * Đảm bảo token luôn được đồng bộ giữa Cookie (cho Server) và LocalStorage (cho Client).
 */
export const authStorage = {
    /**
     * Lấy Access Token hiện tại
     */
    getAccessToken(): string | null {
        // Thử lấy từ Cookie trước (vì Cookie hỗ trợ SSR tốt hơn)
        const cookieToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, { type: "cookie" });

        // Fallback sang LocalStorage nếu không tìm thấy trong Cookie
        const localStorageToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);

        return cookieToken ?? localStorageToken;
    },

    /**
     * Lấy Refresh Token dùng để cấp lại Access Token mới
     */
    getRefreshToken(): string | null {
        return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
    },

    /**
     * Lưu cặp bài trùng Tokens và bóc tách quyền hạn (Role)
     */
    setTokens(accessToken: string, refreshToken: string): void {
        // 1. Lưu Access Token vào COOKIE (Để middleware của Next.js có thể đọc được trên Server)
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
            type: "cookie",
            expireDays: 7, // Hạn dùng 7 ngày
            secure: process.env.NODE_ENV === "production", // Chỉ dùng HTTPS trên Production
        });

        // 2. Lưu Access Token vào LOCALSTORAGE (Phòng hờ cho các request phía Client)
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

        // 3. Lưu Refresh Token vào LOCALSTORAGE
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

        // 4. TIỆN ÍCH: Giải mã JWT (Go-style handling)
        const [, decodeError] = safeSync(() => {
            const payload = accessToken.split(".")[1];
            if (!payload) return;

            const decodedStr = typeof window !== 'undefined'
                ? atob(payload)
                : Buffer.from(payload, 'base64').toString('ascii');

            const decoded = JSON.parse(decodedStr);

            if (decoded && decoded.role) {
                storage.set("role", decoded.role, {
                    type: "cookie",
                    expireDays: 7,
                    secure: process.env.NODE_ENV === "production",
                });
            }
        });

        if (decodeError) {
            console.warn("[STORAGE] Could not decode role from token", decodeError);
        }
    },

    /**
     * Xóa sạch dấu vết đăng nhập (Dùng khi Logout hoặc Token hết hạn)
     */
    clearTokens(): void {
        // Xóa Access Token ở cả 2 nguồn
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN, { type: "cookie" });
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);

        // Xóa Refresh Token
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);

        // Xóa thông tin Role
        storage.remove("role", { type: "cookie" });
    },

    /**
     * Kiểm tra nhanh xem người dùng có đang ở trạng thái 'Đã đăng nhập' hay không
     */
    hasTokens(): boolean {
        return !!this.getAccessToken() && !!this.getRefreshToken();
    },
};

// Export class for custom instances
export { StorageService };
