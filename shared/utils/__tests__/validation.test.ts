import { describe, it, expect } from 'vitest'

import {
    isValidEmail, validatePassword, getPasswordStrength,
    isValidPhone, validateUsername, isEmpty
} from '../validation'

describe('Validation Utilities', () => {

    describe('isValidEmail', () => {
        it('should return true for valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true)
            expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
        })

        it('should return false for invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false)
            expect(isValidEmail('test@')).toBe(false)
            expect(isValidEmail('@example.com')).toBe(false)
            expect(isValidEmail('')).toBe(false)
            expect(isValidEmail(null)).toBe(false)
        })
    })

    describe('validatePassword', () => {
        it('should return valid for strong password', () => {
            expect(validatePassword('StrongPass1!')).toEqual({ isValid: true, message: '' })
        })

        it('should fail for short password', () => {
            expect(validatePassword('short')).toEqual({
                isValid: false,
                message: expect.stringContaining('at least')
            })
        })

        it('should check for empty password', () => {
            expect(validatePassword('')).toEqual({ isValid: false, message: 'Password is required' })
        })
    })

    describe('getPasswordStrength', () => {
        it('should identify weak passwords', () => {
            expect(getPasswordStrength('weak')).toBe('weak')
        })

        it('should identify medium passwords', () => {
            // 8 chars, mixed case
            expect(getPasswordStrength('Password123')).toBe('medium')
        })

        it('should identify strong passwords', () => {
            // >12 chars, mixed case, number, special
            expect(getPasswordStrength('SuperSecretPassword1!')).toBe('strong')
        })
    })

    describe('isValidPhone', () => {
        it('should validate VN phone numbers', () => {
            expect(isValidPhone('0901234567')).toBe(true)
            expect(isValidPhone('0381234567')).toBe(true)
        })

        it('should fail invalid phones', () => {
            expect(isValidPhone('123')).toBe(false) // too short
            expect(isValidPhone('09012345678')).toBe(false) // too long
            expect(isValidPhone('abc')).toBe(false) // nan
        })
    })

    describe('validateUsername', () => {
        it('should validate correct username', () => {
            expect(validateUsername('user_123')).toEqual({ isValid: true, message: '' })
        })

        it('should fail invalid chars', () => {
            expect(validateUsername('user@name')).toEqual({
                isValid: false,
                message: expect.stringContaining('letters, numbers')
            })
        })
    })

    describe('isEmpty', () => {
        it('should detect empty values', () => {
            expect(isEmpty(null)).toBe(true)
            expect(isEmpty(undefined)).toBe(true)
            expect(isEmpty('')).toBe(true)
            expect(isEmpty([])).toBe(true)
            expect(isEmpty({})).toBe(true)
        })

        it('should return false for non-empty', () => {
            expect(isEmpty('a')).toBe(false)
            expect(isEmpty(0)).toBe(false)
            expect(isEmpty([1])).toBe(false)
        })
    })
})
