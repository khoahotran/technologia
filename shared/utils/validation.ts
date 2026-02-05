/**
 * Validation utilities
 * Common validation functions for forms and data validation
 */

import { VALIDATION } from '../constants/app.constants';

// ===========================================
// Email Validation
// ===========================================

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string | undefined | null): boolean {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===========================================
// Password Validation
// ===========================================

/**
 * Validate password meets requirements
 * @param password - Password to validate
 * @returns Validation result with message
 */
export function validatePassword(password: string | undefined | null): {
    isValid: boolean;
    message: string;
} {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
            isValid: false,
            message: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
        };
    }

    if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
        return {
            isValid: false,
            message: `Password must be less than ${VALIDATION.MAX_PASSWORD_LENGTH} characters`,
        };
    }

    return { isValid: true, message: '' };
}

/**
 * Check password strength
 * @param password - Password to check
 * @returns Strength level: 'weak' | 'medium' | 'strong'
 */
export function getPasswordStrength(
    password: string | undefined | null
): 'weak' | 'medium' | 'strong' {
    if (!password || password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return 'weak';
    }

    let strength = 0;

    // Check length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Check character types
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength >= 5) return 'strong';
    if (strength >= 3) return 'medium';
    return 'weak';
}

// ===========================================
// Phone Validation
// ===========================================

/**
 * Validate Vietnamese phone number
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function isValidPhone(phone: string | undefined | null): boolean {
    if (!phone) return false;

    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Vietnamese phone: 10 digits starting with 0
    const phoneRegex = /^0[3-9]\d{8}$/;
    return phoneRegex.test(cleaned);
}

// ===========================================
// Username Validation
// ===========================================

/**
 * Validate username format
 * @param username - Username to validate
 * @returns Validation result with message
 */
export function validateUsername(username: string | undefined | null): {
    isValid: boolean;
    message: string;
} {
    if (!username) {
        return { isValid: false, message: 'Username is required' };
    }

    if (username.length < VALIDATION.MIN_USERNAME_LENGTH) {
        return {
            isValid: false,
            message: `Username must be at least ${VALIDATION.MIN_USERNAME_LENGTH} characters`,
        };
    }

    if (username.length > VALIDATION.MAX_USERNAME_LENGTH) {
        return {
            isValid: false,
            message: `Username must be less than ${VALIDATION.MAX_USERNAME_LENGTH} characters`,
        };
    }

    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
            isValid: false,
            message: 'Username can only contain letters, numbers, and underscores',
        };
    }

    return { isValid: true, message: '' };
}

// ===========================================
// Generic Validators
// ===========================================

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Check if value is a valid number
 * @param value - Value to check
 * @returns True if valid number
 */
export function isValidNumber(value: unknown): boolean {
    if (typeof value === 'number') return !isNaN(value) && isFinite(value);
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return !isNaN(parsed) && isFinite(parsed);
    }
    return false;
}

/**
 * Check if value is within range
 * @param value - Value to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}
