/**
 * Hàm xử lý tập trung kết quả phản hồi từ trình duyệt (Handle API Response).
 * 
 * Kiểm tra mã trạng thái response.ok để quyết định Trả kết quả JSON 
 * hoặc ném lỗi (Throw Error) với thông điệp chi tiết.
 * 
 * @param response Đối tượng Response thô từ trình Fetch
 * @returns Dữ liệu JSON đã được định kiểu T
 * @throws Lỗi kèm theo thông điệp từ Backend hoặc mã trạng thái HTTP
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Thử bóc tách JSON lỗi từ body
    const errorData = await response.json().catch(() => ({}));

    // Ưu tiên lấy trường .error từ Backend trả về, nếu ko có thì dùng Status code
    const errorMessage =
      errorData.error || `Lỗi HTTP! Trạng thái: ${response.status}`;

    // Ghi nhận log chi tiết lỗi cho mục đích Debug
    console.error("Chi tiết lỗi API:", errorData.details);

    throw new Error(errorMessage);
  }

  // Thành công -> Trả về JSON
  return response.json() as Promise<T>;
}
