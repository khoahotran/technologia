/**
 * Hàm bao bọc Fetch (Fetch Wrapper) hỗ trợ Tự động gắn Token.
 * 
 * @param input URL hoặc Request object
 * @param token Chuỗi Access Token (nếu có)
 * @param init Các cấu hình khởi tạo của Fetch (method, headers, body...)
 */
export async function fetchWithAuth(input: RequestInfo, token?: string | null, init?: RequestInit) {
  const headers = new Headers(init?.headers);

  // Nếu có token truyền vào, thực hiện gán vào Header Authorization theo chuẩn Bearer
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}
