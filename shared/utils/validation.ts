/**
 * Tiện ích Xác thực Dữ liệu (Validation utilities)
 * Cung cấp hàm kiểm tra và xác nhận mọi loại Form / Field để dùng chung.
 */

import { VALIDATION } from '../constants/app.constants';

// ===========================================
// Kiểm tra Email (Email Validation)
// ===========================================

/**
 * Kiểm tra xem Email có đúng với định dạng cơ bản không
 */
export function isValidEmail(email: string | undefined | null): boolean {
    if (!email) return false;

    // Pattern cơ bản cho Email: user@domain.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===========================================
// Kiểm tra Mật khẩu (Password Validation)
// ===========================================

/**
 * Đánh giá tính hợp lệ của thẻ Mật khẩu
 * Thỏa mãn cả 2 tiêu chí là min và max length (theo cấu hình constants)
 */
export function validatePassword(password: string | undefined | null): {
    isValid: boolean;
    message: string;
} {
    if (!password) {
        return { isValid: false, message: 'Vui lòng nhập mật khẩu' };
    }

    if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return {
            isValid: false,
            message: `Mật khẩu phải từ ${VALIDATION.MIN_PASSWORD_LENGTH} ký tự trở lên`,
        };
    }

    if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
        return {
            isValid: false,
            message: `Mật khẩu không được vượt quá ${VALIDATION.MAX_PASSWORD_LENGTH} ký tự`,
        };
    }

    return { isValid: true, message: '' };
}

/**
 * Phân tích và chấm điểm "Độ mạnh" của mật khẩu (Weak / Medium / Strong)
 */
export function getPasswordStrength(
    password: string | undefined | null
): 'weak' | 'medium' | 'strong' {
    if (!password || password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
        return 'weak';
    }

    let strength = 0;

    // Chấm điểm theo độ dài
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Chấm điểm theo đa dạng ký tự chữ/số/đặc biệt
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength >= 5) return 'strong';
    if (strength >= 3) return 'medium';
    return 'weak';
}

// ===========================================
// Kiểm tra Số điện thoại (Phone Validation)
// ===========================================

/**
 * Xác thực chuẩn số điện thoại của Việt Nam
 */
export function isValidPhone(phone: string | undefined | null): boolean {
    if (!phone) return false;

    // Loại bỏ các dấu cách khoảng, gạch ngang, chỉ để lại chuỗi định dạng pure Number
    const cleaned = phone.replace(/\D/g, '');

    // Đầu số VN luôn bắt đầu bằng số 0, sau đó là một số khác từ 3->9, theo sau là 8 số nữa (Tổng cộng = 10 kí tự)
    const phoneRegex = /^0[3-9]\d{8}$/;
    return phoneRegex.test(cleaned);
}

// ===========================================
// Kiểm tra Tên tài khoản (Username Validation)
// ===========================================

/**
 * Xác thực định dạng Tên đăng nhập (Username)
 */
export function validateUsername(username: string | undefined | null): {
    isValid: boolean;
    message: string;
} {
    if (!username) {
        return { isValid: false, message: 'Vui lòng nhập tên người dùng' };
    }

    if (username.length < VALIDATION.MIN_USERNAME_LENGTH) {
        return {
            isValid: false,
            message: `Tên người dùng phải có ít nhất ${VALIDATION.MIN_USERNAME_LENGTH} ký tự`,
        };
    }

    if (username.length > VALIDATION.MAX_USERNAME_LENGTH) {
        return {
            isValid: false,
            message: `Tên người dùng không được vượt quá ${VALIDATION.MAX_USERNAME_LENGTH} ký tự`,
        };
    }

    // Cơ chế hạn chế chỉ sử dụng chữ cái, số, hoặc dấu nối "_" (tránh XSS, URL params error)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
            isValid: false,
            message: 'Tên người dùng chỉ được sử dụng chữ cái alpha b, số, dấu gạch dưới',
        };
    }

    return { isValid: true, message: '' };
}

// ===========================================
// Trình Giám Sát Phổ Biến (Generic Validators)
// ===========================================

/**
 * Trình xác minh đánh giá một giá trị có "Trống rỗng" hay không (Dùng thay vì Lodash .isEmpty).
 */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Kiểm thử xem loại dữ liệu là một giá trị định lượng có ý nghĩa thay vì (NaN or Infinity)
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
 * So sánh min, max của tham số hiện tại.
 */
export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}
