import { STORAGE_KEYS } from "@/constants";
import { safeSync } from "@/utils/result";

export type StorageType = "local" | "session";

function isClient(): boolean {
  return typeof window !== "undefined";
}

class StorageService {
  private type: StorageType;

  constructor(type: StorageType = "local") {
    this.type = type;
  }

  private getStorage(): Storage | null {
    if (!isClient()) return null;
    return this.type === "local" ? window.localStorage : window.sessionStorage;
  }

  set<T>(key: string, value: T): void {
    const storage = this.getStorage();
    if (!storage) return;

    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    safeSync(() => storage.setItem(key, serialized));
  }

  get<T>(key: string): T | null {
    const storage = this.getStorage();
    const value = storage?.getItem(key) ?? null;

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

  remove(key: string): void {
    this.getStorage()?.removeItem(key);
  }

  clear(): void {
    this.getStorage()?.clear();
  }
}

export const storage = new StorageService("local");

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

