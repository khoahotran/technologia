/**
 * Tiện ích Định dạng (Formatting Utilities)
 * Cung cấp các hàm dùng chung để chuẩn hóa cách hiển thị tiền tệ, ngày tháng, văn bản.
 */

import { APP_CONFIG } from '../constants/app.constants';

// ===========================================
// Định dạng Tiền tệ (Currency Formatting)
// ===========================================

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

export function formatDate(
    date: string | Date | undefined | null,
    locale: string = APP_CONFIG.DEFAULT_LOCALE
): string {
    if (!date) {
        return '';
    }

    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(parsedDate.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    }).format(parsedDate);
}