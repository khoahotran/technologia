import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tiện ích kết hợp Class Name (Tailwind CSS)
 * 
 * Kết hợp `clsx` và `tw-merge` để xử lý việc gộp các class Tailwind một cách thông minh.
 * Giúp giải quyết xung đột (conflict) giữa các class và hỗ trợ điều kiện render class.
 * 
 * @param inputs Danh sách các class string, object hoặc array
 * @returns Chuỗi class đã được tối ưu và gộp lại
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
