"use client";

/**
 * Giao diện Lỗi Toàn cục (Global Error Boundary)
 * 
 * Bắt và hiển thị các lỗi React trong toàn bộ ứng dụng (Client-side errors).
 * Cho phép người dùng thử tải lại trang bằng cách gọi hàm `reset`.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: 40 }}>
      <h2>Đã xảy ra lỗi</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Thử lại</button>
    </div>
  );
}
