/**
 * Formatting utilities
 * Common formatting functions for consistent display across the app
 */

import { APP_CONFIG } from '../constants/app.constants';

// ===========================================
// Currency Formatting
// ===========================================

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: VND)
 * @param locale - Locale for formatting (default: vi-VN)
 * @returns Formatted currency string
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
 * Format a number with thousand separators
 * @param num - The number to format
 * @param locale - Locale for formatting
 * @returns Formatted number string
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
// Date Formatting
// ===========================================

/**
 * Format a date to localized string
 * @param date - Date to format (Date object, string, or timestamp)
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale for formatting
 * @returns Formatted date string
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
 * Format a date with time
 * @param date - Date to format
 * @param locale - Locale for formatting
 * @returns Formatted datetime string
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
 * Get relative time string (e.g., "2 hours ago")
 * @param date - Date to compare
 * @param locale - Locale for formatting
 * @returns Relative time string
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
// Text Formatting
// ===========================================

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add (default: "...")
 * @returns Truncated text
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
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
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
 * Convert string to slug (URL-friendly format)
 * @param text - Text to convert
 * @returns Slugified text
 * 
 * @example
 * slugify("Hello World!") // "hello-world"
 */
export function slugify(text: string | undefined | null): string {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// ===========================================
// Phone Number Formatting
// ===========================================

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number
 * 
 * @example
 * formatPhone("0901234567") // "090 123 4567"
 */
export function formatPhone(phone: string | undefined | null): string {
    if (!phone) return '';

    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Vietnam phone format (10 digits)
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }

    // Return as-is if format is unknown
    return cleaned;
}
