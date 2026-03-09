import { STORAGE_KEYS } from "@/constants";
import { safeSync } from "@/utils/result";

export type StorageType = "local" | "session" | "memory";

export interface StorageOptions {
  type?: StorageType;
}

const memoryStorage = new Map<string, string>();

function isClient(): boolean {
  return typeof window !== "undefined";
}

class StorageService {
  private defaultType: StorageType;

  constructor(defaultType: StorageType = "local") {
    this.defaultType = defaultType;
  }

  private getStorage(type: StorageType): Storage | null {
    if (!isClient()) return null;
    if (type === "local") return window.localStorage;
    if (type === "session") return window.sessionStorage;
    return null;
  }

  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    const type = options.type ?? this.defaultType;
    const serialized = typeof value === "string" ? value : JSON.stringify(value);

    if (type === "memory" || !isClient()) {
      memoryStorage.set(key, serialized);
      return;
    }

    const storage = this.getStorage(type);
    if (!storage) return;

    const [, error] = safeSync(() => storage.setItem(key, serialized));
    if (error) {
      memoryStorage.set(key, serialized);
    }
  }

  get<T>(key: string, options: StorageOptions = {}): T | null {
    const type = options.type ?? this.defaultType;
    let value: string | null = null;

    if (type === "memory" || !isClient()) {
      value = memoryStorage.get(key) ?? null;
    } else {
      const storage = this.getStorage(type);
      value = storage?.getItem(key) ?? null;
    }

    if (value === null) return null;

    if (
      value.startsWith("{") ||
      value.startsWith("[") ||
      value === "true" ||
      value === "false" ||
      (value.startsWith("\"") && value.endsWith("\""))
    ) {
      const [parsed, error] = safeSync(() => JSON.parse(value) as T);
      if (!error) return parsed;
    }

    return value as unknown as T;
  }

  remove(key: string, options: StorageOptions = {}): void {
    const type = options.type ?? this.defaultType;

    if (type === "memory" || !isClient()) {
      memoryStorage.delete(key);
      return;
    }

    const storage = this.getStorage(type);
    storage?.removeItem(key);
  }

  has(key: string, options: StorageOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  clear(type?: StorageType): void {
    const target = type ?? this.defaultType;
    if (target === "memory") {
      memoryStorage.clear();
      return;
    }
    if (!isClient()) return;
    this.getStorage(target)?.clear();
  }
}

export const storage = new StorageService("local");
export const sessionStorage = new StorageService("session");

export const authStorage = {
  getAccessToken(): string | null {
    return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken(): string | null {
    return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearTokens(): void {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },
};

export { StorageService };
