# Hướng dẫn Đọc hiểu Cấu trúc Dự án (Architecture Walkthrough)

Dự án này được xây dựng theo kiến trúc phân lớp (Layered Architecture), giúp tách biệt rõ ràng trách nhiệm giữa logic nghiệp vụ, giao diện người dùng và hạ tầng kỹ thuật. Dưới đây là kế hoạch chi tiết để bạn nắm bắt dự án một cách hệ thống.

---

## 1. Bản đồ Chi tiết từng Tầng (Layer Deep-Dive)

### 📂 `domain/` (Tầng nghiệp vụ - Source of Truth)

Đây là "trái tim" của ứng dụng, nơi định nghĩa luật chơi.

- 📁 `domain/*/entities/`: Định nghĩa các interface/schema cốt lõi (VD: `product.entity.ts`). Tầng này không phụ thuộc vào bất kỳ thư viện bên ngoài nào ngoại trừ Zod để đảm bảo dữ liệu "sạch".
- 📁 `domain/*/repositories/`: Chứa các **Interface**. Nó định nghĩa các phương thức mà hệ thống cần (như `login`, `getCart`), nhưng không quan tâm Backend thực hiện nó thế nào.
- 📁 `domain/errors/`: Chứa các định nghĩa lỗi tùy chỉnh như `AppError`, `AuthenticationError`. Giúp UI hiển thị thông báo lỗi thân thiện thay vì các mã code vô nghĩa.

### 📂 `infrastructure/` (Tầng kỹ thuật - The Engine)

Nơi biến các định nghĩa ở Domain thành hành động thực tế bằng code kỹ thuật.

- 📄 `infrastructure/http/client.ts`: Cấu hình trung tâm cho **Axios**. Chứa các Interceptor để tự động đính kèm Token và handle **Refresh Token** tự động khi gặp lỗi 401.
- 📄 `infrastructure/http/fetch-with-token.ts`: Một giải pháp thay thế cho Axios dựa trên Fetch API chuẩn. Nó giải quyết triệt để vấn đề "Race Condition" khi có nhiều request cùng bị hết hạn token một lúc nhờ cơ chế **Lock Promise**.
- 📄 `infrastructure/http/api-error-mapper.ts`: Bộ chuyển đổi thông minh. Nó nhận lỗi thô từ Backend (ví dụ 404, 500) và ánh xạ sang các class lỗi ở tầng Domain để xử lý tập trung.
- 📄 `infrastructure/persistence/storage.ts`: Lớp trừu tượng cho việc lưu trữ. Nó tự động nhận diện môi trường (Server-side hay Client-side) để lưu/đọc dữ liệu từ `cookies` hoặc `localStorage` một cách an toàn.

### 📂 `application/` (Tầng Use Cases - The Orchestrator)

Nơi điều phối luồng dữ liệu, kết nối Domain và Infrastructure.

- 📁 `application/use-cases/*/`: Chứa các logic quy trình thực tế.
  - Ví dụ: `login.use-case.ts` sẽ chịu trách nhiệm: Gọi API Login -> Lưu Token -> Cập nhật trạng thái User toàn cục. UI chỉ cần gọi đúng 1 hàm này.

### 📂 `presentation/` (Tầng Giao diện - UI Architecture)

Nơi quản lý logic hiển thị và trạng thái ứng dụng.

- 📁 `presentation/store/`: Quản lý trạng thái toàn cục bằng **Zustand**. Giúp truy cập thông tin User hoặc Giỏ hàng từ bất kỳ đâu trong app mà không bị "prop-drilling".
- 📁 `presentation/hooks/`: Tập hợp các custom hooks mạnh mẽ sử dụng **TanStack Query**. Nó giúp tự động Caching, tự động tải lại dữ liệu khi mạng quay trở lại (Auto-refetch).

### 📂 `app/` (Next.js Framework)

- 📁 `app/api/**/*`: Hệ thống **API Proxy Route**. Bạn sẽ không bao giờ gọi trực tiếp đến Backend port :8081 từ Browser. Bạn sẽ gọi đến `/api/auth/login`, và Next.js sẽ chuyển tiếp nó đi. Điều này giúp bảo mật token và tránh lỗi CORS.
- 📁 `app/(shop)/...`: Folder chứa các trang hiển thị. Các file `...Client.tsx` là nơi tập trung hầu hết logic tương tác (Interactivity) của React.

---

## 2. Luồng chạy thực tế của một tính năng (Ví dụ: Thêm vào giỏ hàng)

Hãy theo dõi lộ trình của dữ liệu để hiểu sự liên kết:

1.  **UI Level**: Người dùng nhấn nút tại `ProductDetailClient.tsx`.
2.  **Hook Level**: Gọi `useAddToCartMutation` (`presentation/hooks/use-cart.ts`).
3.  **Use Case Level**: Mutation này thực thi hàm từ `CartRepository`.
4.  **Infrastrucure Level**: `CartRepository` gọi `fetchWithToken`.
5.  **Proxy Level**: Request đi qua `app/api/carts/add-to-cart/route.ts`. Tại đây, Token được lấy từ Cookie và gắn vào header.
6.  **Backend Level**: Request đến Server thật (`:8083`).
7.  **Callback**: Dữ liệu thành công quay về -> Xóa cache giỏ hàng cũ -> UI tự động nhảy số lượng sản phẩm mới mà không cần F5 trang.

---

## 3. Các file "Kim chỉ nam" cần đọc ngay

1.  📄 `shared/validators/api-schemas.ts`: Danh sách tất cả các thực thể dữ liệu. Đọc cái này là hiểu app đang làm về cái gì.
2.  📄 `infrastructure/http/fetch-with-token.ts`: Hiểu cách dự án giao tiếp với thế giới bên ngoài.
3.  📄 `public/globals.css`: Hiểu quy tắc thẩm mỹ và bảng màu (Design System) của dự án.
4.  📄 `package.json`: Danh sách các "vũ khí" công nghệ app đang sử dụng.

---

## 4. Quản lý Lỗi phong cách Go (Go-style Error Handling)

Dự án hỗ trợ một tiện ích đặc biệt giúp bạn xử lý lỗi theo kiểu `[data, err]` của ngôn ngữ Go, giúp code sạch hơn và không bị "lạm dụng" `try-catch`.

- **Tiện ích**: `safe(promise)` từ `@/shared/utils/result`.
- **Cách dùng**:

```typescript
const [data, err] = await safe(CartRepository.addToCart(payload));

if (err) {
  // Handle error ngay lập tức
  return { ok: false, error: getErrorMessage(err) };
}

// Tiếp tục xử lý data nếu thành công
console.log(data);
```

Sử dụng `safe` giúp logic code luôn đi theo "con đường thẳng" (Happy Path), giảm độ lồng nhau của các khối lệnh.

---

## 4. Mẹo Debug nhanh

- Nếu UI không hiện dữ liệu: Check ngay `api-schemas.ts`. Thường là do Backend trả về dữ liệu không khớp với Zod Schema.
- Nếu bị Logout vô lý: Debug file `storage.ts` và `fetch-with-token.ts` để xem token có bị ghi đè hoặc mất tích không.
- Nếu muốn đổi giao diện: Sửa các component tại `components/ui/`. Mọi trang dùng component đó sẽ thay đổi theo.

---
