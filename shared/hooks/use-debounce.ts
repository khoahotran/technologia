"use client";

/**
 * Hook useDebounce
 *
 * Trì hoãn (delay) quá trình cập nhật giá trị trong một khoảng thời gian `delay` (ms).
 * Cực kỳ hữu ích trong các trường hợp chống gọi API liên tục như: Gõ thanh tìm kiếm, cuộn trang.
 * Đã được chuyển từ presentation/hooks sang shared/hooks để mọi layer (kể cả admin)
 * đều có thể dùng chung.
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 * 
 * @param value Giá trị đầu vào cần trì hoãn
 * @param delay Thời gian delay (mặc định: 300ms)
 */
import * as React from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
    // Lưu giữ state phản chiếu giá trị đã được debounced
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        // Khởi tạo bộ đếm lùi
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Hàm dọn dẹp (cleanup) chạy mỗi khi 'value' hoặc 'delay' bị thay đổi 
        // -> Hủy timeout cũ để reset lại từ đầu
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
