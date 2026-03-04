/**
 * Kiểu dữ liệu Tiện ích Chung (Common Utility Types)
 * Được tái sử dụng xuyên suốt nhiều File trong toàn bộ dự án.
 */

// Biến tất cả các properties của một Đối tượng (Object) thành Tùy chọn (Optional) dựa theo đệ quy sâu.
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Trích xuất tự động danh sách các Khóa (Keys) của Object `T` nếu thỏa mãn điều kiện mang giá trị thuộc kiểu `V`.
export type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// Có thể chứa giá trị Null
export type Nullable<T> = T | null;

// Có thể chứa giá trị Undefined (không tồn tại / không ép buộc ghi)
export type Optional<T> = T | undefined;

// Kiểu định danh gốc cho các Thực thể dùng chung (EntityId)
export type EntityId = string | number;

// Hỗ trợ hiển thị Trạng thái (Thường dùng cho Product / Item)
export type Status = 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

// Hướng sắp xếp (Tăng dần / Giảm dần)
export type SortDirection = 'ASC' | 'DESC';

// ===========================================
// Hữu dụng cho các Type Function Truyền lại (Callbacks)
// ===========================================
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;
export type AsyncValueCallback<T> = (value: T) => Promise<void>;

// Kiểu dữ liệu đóng gói State của Form
export interface FormState<T> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Kiểu dữ liệu đóng gói quá trình chờ Load Dữ liệu ở UI
export interface LoadingState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}
