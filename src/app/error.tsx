"use client";

/**
 * Giao diện Lỗi Toàn cục (Global Error Boundary)
 * 
 * Bắt và hiển thị các lỗi React trong toàn bộ ứng dụng (Client-side errors).
 * Cho phép người dùng thử tải lại trang bằng cách gọi hàm `reset`.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 text-center space-y-4">
      <h2 className="text-2xl font-bold text-red-600">Đã xảy ra lỗi</h2>
      <p className="text-gray-600 max-w-md">{error.message}</p>
      <button
        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
        onClick={() => reset()}
      >
        Thử lại
      </button>
    </div>
  );
}
