/**
 * Tiện ích Định dạng (Formatting Utilities)
 * Cung cấp các hàm dùng chung để chuẩn hóa cách hiển thị tiền tệ, ngày tháng, văn bản.
 */

import { APP_CONFIG } from '../constants/app.constants';

// ===========================================
// Định dạng Tiền tệ (Currency Formatting)
// ===========================================

/**
 * Định dạng một số thành chuỗi tiền tệ.
 * @param amount - Số tiền cần định dạng (số hoặc chuỗi)
 * @param currency - Mã tiền tệ (mặc định: VND)
 * @param locale - Ngôn ngữ hiển thị (mặc định: vi-VN)
 * @returns Chuỗi tiền tệ đã được định dạng
 * 
 * @example
 * formatCurrency(100000) // "100.000 ₫"
 * formatCurrency(99.99, 'USD', 'en-US') // "$99.99"
 */
export function formatCurrency(
    amount: number | string | undefined | null,
    currency: string = APP_CONFIG.DEFAULT_CURRENCY,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) {
        return formatCurrency(0, currency, locale);
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: currency === 'VND' ? 0 : 2,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(numericAmount);
}

/**
 * Định dạng số với dấu phân cách hàng nghìn
 * @param num - Số cần định dạng
 * @param locale - Ngôn ngữ hiển thị
 * @returns Chuỗi số đã được định dạng
 * 
 * @example
 * formatNumber(1234567) // "1.234.567"
 */
export function formatNumber(
    num: number | string | undefined | null,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    const numericValue = typeof num === 'string' ? parseFloat(num) : num;

    if (numericValue === undefined || numericValue === null || isNaN(numericValue)) {
        return '0';
    }

    return new Intl.NumberFormat(locale).format(numericValue);
}

// ===========================================
// Định dạng Ngày tháng (Date Formatting)
// ===========================================

/**
 * Định dạng ngày tháng thành chuỗi theo chuẩn quốc gia (Locale)
 * @param date - Ngày cần định dạng (Date object, chuỗi, hoặc timestamp)
 * @param options - Cấu hình Intl.DateTimeFormatOptions
 * @param locale - Ngôn ngữ hiển thị
 * @returns Chuỗi ngày tháng đã được định dạng
 * 
 * @example
 * formatDate(new Date()) // "03/02/2026"
 * formatDate('2026-02-03', { dateStyle: 'full' }) // "Thứ Ba, 3 tháng 2, 2026"
 */
export function formatDate(
    date: Date | string | number | undefined | null,
    options?: Intl.DateTimeFormatOptions,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return '';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
}

/**
 * Định dạng ngày gồm Cả ngày lẫn giờ
 * @param date - Ngày/giờ cần định dạng
 * @param locale - Ngôn ngữ hiển thị
 * @returns Chuỗi ngày và giờ đã định dạng
 * 
 * @example
 * formatDateTime(new Date()) // "03/02/2026 14:30"
 */
export function formatDateTime(
    date: Date | string | number | undefined | null,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    return formatDate(date, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }, locale);
}

/**
 * Lấy chuỗi mô tả thời gian tương đối so với thời điểm hiện tại
 * @param date - Thời điểm để so sánh với lúc này
 * @param locale - Ngôn ngữ hiển thị (VD: "vi-VN" -> "trước")
 * @returns Chuỗi mô tả tương đối ("1 giờ trước", "5 phút trước",...)
 * 
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000)) // "1 giờ trước"
 */
export function formatRelativeTime(
    date: Date | string | number | undefined | null,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
        return '';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
        return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 2592000) {
        return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 31536000) {
        return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
        return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
}

// ===========================================
// Định dạng Văn bản (Text Formatting)
// ===========================================

/**
 * Rút gọn chuỗi văn bản nếu nó quá dài
 * @param text - Chuỗi văn bản gốc
 * @param maxLength - Số lượng ký tự tối đa
 * @param suffix - Thành phần phía sau được thêm nếu văn bản bị cắt (Mặc định: "...")
 * @returns Chuỗi văn bản đã bị cắt hoặc giữ nguyên
 * 
 * @example
 * truncateText("This is a long text", 10) // "This is a..."
 */
export function truncateText(
    text: string | undefined | null,
    maxLength: number,
    suffix: string = '...'
): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Viết hoa kí tự đầu tiên của tất cả các từ trong chuỗi văn bản
 * @param text - Chuỗi văn bản cần được quy chuẩn
 * 
 * @example
 * capitalizeWords("hello world") // "Hello World"
 */
export function capitalizeWords(text: string | undefined | null): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Chuyển đổi một tên thông thường thành dạng Slug (chuỗi thân thiện với URL)
 * @param text - Chuỗi dùng để tạo Slug
 * @returns Slug theo định dạng chuẩn SEO (chỉ có kí tự không dấu, thường và dấu gạch nối ngang)
 * 
 * @example
 * slugify("Hello World! 2026") // "hello-world-2026"
 */
export function slugify(text: string | undefined | null): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu tiếng Việt
        .replace(/[^a-z0-9\s-]/g, '') // Bỏ hết kí tự đặc biệt khác 
        .replace(/\s+/g, '-') // Đổi các khoảng trắng thành dấu gạch ngang
        .replace(/-+/g, '-') // Chỉ giữ một dấu gạch ngang nếu chúng nằm liên tiếp nhau
        .replace(/^-|-$/g, ''); // Bỏ các dấu gạch ngang rác ở đầu và cuối chuỗi
}

// ===========================================
// Định dạng Số điện thoại (Phone Number Formatting)
// ===========================================

/**
 * Làm đẹp hiển thị của Số Điện thoại
 * @param phone - Số điện thoại gốc
 * @returns Số điện thoại có định dạng chuẩn (ví dụ "090 123 4567")
 * 
 * @example
 * formatPhone("0901234567") // "090 123 4567"
 */
export function formatPhone(phone: string | undefined | null): string {
    if (!phone) return '';

    // Lọc bỏ mọi thứ không phải là số
    const cleaned = phone.replace(/\D/g, '');

    // Nếu chuẩn SDT Việt Nam (10 số) -> tách làm 3 khối : 3 - 3 - 4
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    // Nếu cấu trúc lạ, trả về chuỗi đã làm sạch thô
    return cleaned;
}
