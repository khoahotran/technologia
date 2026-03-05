/**
 * Quản lý ngôn ngữ (Locale Management)
 * 
 * Cung cấp các phương thức để xử lý việc lưu trữ, thay đổi và tải 
 * các tệp từ điển ngôn ngữ (.json) tương ứng cho ứng dụng.
 */

import { safe } from "@/shared/utils/result";

let currentLocale = "en";

/**
 * Lấy ngôn ngữ đã được lưu trong LocalStorage
 */
function getStoredLocale(): string {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("locale") || "en";
}

/**
 * Khởi tạo ngôn ngữ ban đầu cho ứng dụng
 */
export function initLocale(): string {
    currentLocale = getStoredLocale();
    return currentLocale;
}

/**
 * Thay đổi ngôn ngữ hiện tại và lưu vào LocalStorage
 * @param locale - Mã ngôn ngữ mới (VD: 'vi', 'en')
 */
export function setLocale(locale: string) {
    currentLocale = locale;
    if (typeof window !== "undefined") {
        localStorage.setItem("locale", locale);
    }
}

/**
 * Lấy mã ngôn ngữ đang được sử dụng
 */
export function getLocale() {
    return currentLocale;
}

/**
 * Tải động (Lazy load) tệp JSON ngôn ngữ tương ứng
 * @param locale - Mã ngôn ngữ cần tải (tùy chọn)
 */
export async function loadLocale(locale?: string) {
    const target = locale || currentLocale;
    const [messages, error] = await safe(import(`@/locales/${target}.json`));

    if (error !== null) {
        console.warn(`Locale "${target}" không tìm thấy, đang chuyển về dùng tiếng Anh ("en").`);
        const [fallback] = await safe(import(`@/locales/en.json`));
        return fallback?.default || fallback || {};
    }

    return messages?.default || messages;
}
