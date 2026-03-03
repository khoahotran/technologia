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

class StorageService {
    private defaultType: StorageType;

    constructor(defaultType: StorageType = "local") {
        this.defaultType = defaultType;
    }

    /**
     * Get the appropriate storage based on type and environment
     */
    private getStorage(type: StorageType): Storage | null {
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
     * Set a value in storage
     */
    set<T>(key: string, value: T, options: StorageOptions = {}): void {
        const type = options.type ?? this.defaultType;
        const serialized = typeof value === "string" ? value : JSON.stringify(value);

        if (type === "cookie") {
            setCookie(key, serialized, options);
            return;
        }

        if (type === "memory" || !isClient()) {
            memoryStorage.set(key, serialized);
            return;
        }

        const storage = this.getStorage(type);
        if (storage) {
            try {
                storage.setItem(key, serialized);
            } catch {
                // Fallback to memory if localStorage is full
                memoryStorage.set(key, serialized);
            }
        }
    }

    /**
     * Get a value from storage
     */
    get<T>(key: string, options: StorageOptions = {}): T | null {
        const type = options.type ?? this.defaultType;

        let value: string | null = null;

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

        // Optimized parsing: only parse if it looks like JSON object or array or boolean
        if (
            typeof value === "string" &&
            (value.startsWith("{") ||
                value.startsWith("[") ||
                value === "true" ||
                value === "false" ||
                (value.startsWith("\"") && value.endsWith("\"")))
        ) {
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        }

        return value as unknown as T;
    }

    /**
     * Remove a value from storage
     */
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

    /**
     * Check if a key exists in storage
     */
    has(key: string, options: StorageOptions = {}): boolean {
        return this.get(key, options) !== null;
    }

    /**
     * Clear all items from storage
     */
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
// Singleton Instances
// ===========================================

/** Default storage using localStorage */
export const storage = new StorageService("local");

/** Session storage */
export const sessionStorage = new StorageService("session");

/** Cookie storage */
export const cookieStorage = new StorageService("cookie");

// ===========================================
// Auth Token Helpers
// ===========================================

export const authStorage = {
    /**
     * Get access token
     */
    getAccessToken(): string | null {
        // Try cookie first (server-accessible), then localStorage
        console.log("[STORAGE] Getting access token...");
        
        const cookieToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN, { type: "cookie" });
        console.log("[STORAGE] Cookie token check", {
            hasCookieToken: !!cookieToken,
            cookieTokenLength: cookieToken?.length,
            cookieTokenPrefix: cookieToken?.substring(0, 20),
        });

        const localStorageToken = storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
        console.log("[STORAGE] LocalStorage token check", {
            hasLocalStorageToken: !!localStorageToken,
            localStorageTokenLength: localStorageToken?.length,
            localStorageTokenPrefix: localStorageToken?.substring(0, 20),
        });

        const result = cookieToken ?? localStorageToken;
        console.log("[STORAGE] Final token result", {
            hasToken: !!result,
            source: cookieToken ? "cookie" : localStorageToken ? "localStorage" : "none",
            tokenLength: result?.length,
        });

        return result;
    },

    /**
     * Get refresh token
     */
    getRefreshToken(): string | null {
        console.log("[STORAGE] Getting refresh token...");
        
        const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
        
        console.log("[STORAGE] Refresh token check", {
            hasRefreshToken: !!refreshToken,
            refreshTokenLength: refreshToken?.length,
            refreshTokenPrefix: refreshToken?.substring(0, 20),
            storageKey: STORAGE_KEYS.REFRESH_TOKEN,
        });

        return refreshToken;
    },

    /**
     * Set auth tokens and extract role for middleware
     */
    setTokens(accessToken: string, refreshToken: string): void {
        console.log("[STORAGE] setTokens() called", {
            accessTokenLength: accessToken?.length,
            accessTokenPrefix: accessToken?.substring(0, 20),
            refreshTokenLength: refreshToken?.length,
            refreshTokenPrefix: refreshToken?.substring(0, 20),
        });

        // Store access token in both cookie (for SSR) and localStorage
        console.log("[STORAGE] Setting access token to COOKIE");
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken, {
            type: "cookie",
            expireDays: 7,
            secure: process.env.NODE_ENV === "production",
        });
        console.log("[STORAGE] ✓ Access token saved to cookie");

        console.log("[STORAGE] Setting access token to LOCALSTORAGE");
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        console.log("[STORAGE] ✓ Access token saved to localStorage");

        console.log("[STORAGE] Setting refresh token to LOCALSTORAGE");
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        console.log("[STORAGE] ✓ Refresh token saved to localStorage");

        // Attempt to decode role and save it in a cookie for Next.js middleware
        try {
            const payload = accessToken.split(".")[1];
            console.log("[STORAGE] Attempting to decode JWT payload", {
                hasPayload: !!payload,
                payloadLength: payload?.length,
            });

            if (payload) {
                // Use Buffer for base64 decoding to support both browser & Node environments (if SSR)
                const decodedStr = typeof window !== 'undefined'
                    ? atob(payload)
                    : Buffer.from(payload, 'base64').toString('ascii');
                const decoded = JSON.parse(decodedStr);
                console.log("[STORAGE] Decoded JWT payload", {
                    sub: decoded.sub,
                    role: decoded.role,
                    iat: decoded.iat,
                    exp: decoded.exp,
                });

                if (decoded && decoded.role) {
                    console.log("[STORAGE] Setting role to cookie", { role: decoded.role });
                    storage.set("role", decoded.role, {
                        type: "cookie",
                        expireDays: 7,
                        secure: process.env.NODE_ENV === "production",
                    });
                    console.log("[STORAGE] ✓ Role saved to cookie");
                }
            }
        } catch (e) {
            console.warn("[STORAGE] Could not decode role from token", {
                error: e instanceof Error ? e.message : String(e),
            });
        }

        console.log("[STORAGE] setTokens() COMPLETED SUCCESSFULLY");
    },

    /**
     * Clear auth tokens
     */
    clearTokens(): void {
        console.warn("[STORAGE] clearTokens() called - CLEARING ALL AUTH DATA", {
            timestamp: new Date().toISOString(),
            stackTrace: new Error().stack?.split("\n").slice(0, 3).join("\n"),
        });

        console.log("[STORAGE] Removing access token from cookie");
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN, { type: "cookie" });
        
        console.log("[STORAGE] Removing access token from localStorage");
        storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        
        console.log("[STORAGE] Removing refresh token from localStorage");
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        
        console.log("[STORAGE] Removing role from cookie");
        storage.remove("role", { type: "cookie" }); // Clear role cookie as well

        console.warn("[STORAGE] clearTokens() COMPLETED - ALL AUTH DATA CLEARED");
    },

    /**
     * Check if user has tokens
     */
    hasTokens(): boolean {
        return !!this.getAccessToken() && !!this.getRefreshToken();
    },
};

// Export class for custom instances
export { StorageService };
