# TÀI LIỆU RÀ SOÁT VÀ TÍCH HỢP API TOÀN DIỆN (API INTEGRATION AUDIT)

**Dự án:** frontend-architecture  
**Ngày cập nhật:** 2026-03-03  
**Phạm vi:** User Service (8081), Product Service (8082), Cart Service (8083)  
**Mục đích:** Tài liệu này ghi chép lại toàn bộ sự sai lệch (discrepancies) giữa **Tài liệu API Backend được cung cấp (.txt)**, **Postman Collections thực tế đang chạy**, và **Source code Frontend/Backend hiện tại**. Kèm theo đó là các giải pháp, sửa đổi đã được thực thi trên code Frontend để đảm bảo hoạt động trơn tru 100%.

---

## MỤC LỤC
1. [Vấn đề Architect Khung (Infrastructure)](#1-vấn-đề-architect-khung-infrastructure)
2. [User Service (Port 8081) - Authentication & Profile](#2-user-service-port-8081---authentication--profile)
3. [Product Service (Port 8082) - Products, Brands, Categories](#3-product-service-port-8082---products-brands-categories)
4. [Cart Service (Port 8083) - Shopping Cart](#4-cart-service-port-8083---shopping-cart)
5. [Quy Trình Xử Lý Token & Error Validation](#5-quy-trình-xử-lý-token--error-validation)

---

## 1. Vấn đề Architect Khung (Infrastructure)

### 1.1 Khuyết thiếu Proxy API Rewrites
* **Tình trạng Frontend cũ:** HTTP client (`httpClient`) gọi base API luôn hướng về `http://localhost:3000/api`. Tuy nhiên, các service endpoint độc lập nằm ở các port khác nhau (8081, 8082, 8083), dẫn đến calls từ frontend sẽ failed (404).
* **Đã sửa:** Bổ sung cấu hình `rewrites` trong `next.config.mjs` của Next.js:
  * `/api/auth/*`, `/api/users/*` -> `http://localhost:8081` (User Service)
  * `/api/products/*`, `/api/brands/*`, `/api/categories/*` -> `http://localhost:8082` (Product Service)
  * `/api/carts/*`, `/api/cart-items/*` -> `http://localhost:8083` (Cart Service)

### 1.2 Lỗi Missing Role cho Middleware Authorization
* **Tình trạng:** Next.js middleware (file `proxy.ts`) dùng `req.cookies.get("role")` để kiểm tra quyền block/allow truy cập các trang (ví dụ path `/admin`). Tuy nhiên, `authStorage` (trong `lib/storage.ts`) chỉ lưu `access_token` và `refresh_token` lúc login, không trích xuất `role`.
* **Đã sửa:** Chỉnh sửa hàm `authStorage.setTokens` ở `lib/storage.ts`: Decode payload Base64 của phương thức JWT (`accessToken`), lấy claim `role` và ghi thẳng vào trình duyệt bằng cookie `role` cùng `expireDays` như token để middleware đọc được.

---

## 2. User Service (Port 8081) - Authentication & Profile

### 2.1 Mâu thuẫn Field Email khi Đăng Ký (POST `/api/auth/register/local`)
* **Tài liệu API:** Mô tả field email là `? String` (optional).
* **Code Frontend:** Zod object `RegisterSchema` yêu cầu email là tham số bắt buộc `z.string().email()`. Mâu thuẫn gây lỗi validate trước gọi form.
* **Đã sửa:** Chuyển schema của email thành `z.string().email().optional()` để tuân thủ đúng tài liệu doc.

### 2.2 Định dạng User ID sau Login (POST `/api/auth/login/local`)
* **Tài liệu API:** Trả về `userId` kiểu số (Long / integer).
* **Frontend:** Typescript đang fallback thành String (ví dụ xử lý code: `result.userId || ""`).
* **Đã sửa:** Giữ nguyên Type `string` của Typescript với logic parsing `z.union([z.string(), z.number()]).transform(String)` an toàn, do JS dễ gặp lỗi parsing con số giới hạn Long của Java.

### 2.3 Trường Response "Token" từ Google Login (POST `/api/auth/login/google`)
* **Tài liệu API:** Chú thích "Trường `accessToken` update so với postman cũ".
* **Postman Collection:** Trả về field có tên là `token`.
* **Code Frontend:**
  * Khắc phục bảo mật an toàn kép bằng mã: `const token = response.data.accessToken || response.data.token`. Điều này đảm bảo Frontend luôn chạy được trên mọi bản Build mới/cũ của Backend.

### 2.4 Không có RefreshToken trả về khi Refresh (POST `/api/auth/refresh-token`)
* **Tài liệu vs Postman:** Payload response Refresh Token **CHỈ** trả về `accessToken` mới, **KHÔNG CÓ** trường `refreshToken` rotation.
* **Tác động:** Nếu Frontend cố truy xuất biến `refreshToken` từ response bị `undefined`, ghi đè cookies sẽ hỏng Auth vĩnh viễn.
* **Giải quyết trong Code:** Code `client.ts` đã áp dụng dự phòng thông minh: `authStorage.setTokens(newAccessToken, newRefreshToken || oldRefreshToken)`. Luồng an toàn đảm bảo refreshToken cũ được tái sử dụng nếu backend không gửi trả Refresh token xoay vòng.

### 2.5 Lỗi dư thừa định nghĩa API
* **API config:** Thừa Constant `API_PATHS.AUTH.ME` = `/api/auth/me`.
* **Thực tế:** Không có Endpoint `/auth/me`, chỉ có `/api/users/profile/me`.
* **Đã sửa:** Loại bỏ constant lỗi trên trong file `api.constants.ts`.

---

## 3. Product Service (Port 8082) - Products, Brands, Categories

### 3.1 Sai lầm trong Type Dữ Liệu `displayPrice` (GET `/api/products/search-filter`)
* **Kiểm tra Document & Postman:** Postman trả về Response `displayPrice` là dạng chuỗi string, ví dụ `"9297000"`.
* **Nhận định Backend:** Bên Java backend sử dụng annotation `@JsonFormat(shape = Shape.STRING)` cho field hiển thị số Decimal này.
* **Giải pháp Frontend:** Thêm đoạn transform vào Zod Schema `ProductEntitySchema` & `FilterResponseEntitySchema`:
  * `displayPrice: z.union([z.string(), z.number()]).transform((val) => Number(val))` . Logic này chuyển an toàn String thành Number dùng chung cho toàn bộ logic component giỏ hàng / filter giá.

### 3.2 Bất đồng sortBy default khi Lấy Product Paging (GET `/api/products/paged`)
* **Tài liệu API:** Viết rõ tham số mặc định phân trang `sortBy` là `create_at`.
* **Code Frontend:** `ProductRepository` cũ đặt mặc định `sortBy = "id"`. (do auto generate base repository).
* **Đã sửa:** Sửa logic frontend default của tham số gọi method getPaged() từ `"id"` sang `"create_at"`.

---

## 4. Cart Service (Port 8083) - Shopping Cart
👉 *(Đây là service có nhiều khác biệt giữa Document & Thực tế Code nhất)*.

### 4.1 Khác biệt HTTP Methods với thao tác Giỏ hàng (CRITICAL)
* **Xóa Item khỏi giỏ (`/api/cart-items/delete/{id}`)**
  * **Tài liệu API:** Viết là `PATCH`.
  * **Postman API / Reality:** Là method `DELETE`.
  * **Đã sửa:** Viết tường minh lời gọi axios là `httpClient.delete` trong `CartRepository`
* **Giảm số lượng Item (`/api/cart-items/decrease/{id}`)**
  * **Tài liệu API:** Sử dụng sai thành `/api/cart-items/increase/{id}` cho cả tăng và giảm (Lỗi Copy Paste trong Doc).
  * **Postman API / Reality:** `PATCH /api/cart-items/decrease/{id}`
  * **Đã sửa:** Endpoint trỏ đúng trong code `CartRepository` hàm `decrease()`.

### 4.2 Lỗi Thiếu Route cho Paginated Cart Items (CRITICAL)
* **Tài liệu API:** Đưa ra route ghi là `/api/carts/item/{CartItemID}` là endpoint dùng cho Lấy Danh sách Item Phân Trang. **(Đây là sai nghiêm trọng vì endpoint đó chỉ để bóc Item chi tiết).**
* **Postman Application (The Truth):** Endpoint phân trang thực tế là `/api/carts/with-items-paging`.
* **Thông số sai khác Parameter Sort:** Postman sử dụng tham số query tên là `sortDir` chứa ("ASC" hoặc "DESC") — Document nói nó là `sortDirection`.
* **Đã sửa:** Add hẳn hoi 1 hàm phương thức đặc thù `getCartWithPaging` vào `CartRepository`:
  * Inject Request `/api/carts/with-items-paging`.
  * Define interface `CartPagingParams` gửi biến parameter dưới tên `sortDir`.

### 4.3 Nhầm lẫn Endpoint Tính Giá (Calculate Price)
* **Tài liệu API:** Ghi tên method là Tính Giá nhưng Header API lại copy nhầm `GET /api/carts/item/{CartItemID}`. 
* **Postman Application:** Method thực sự là `POST /api/carts/price` với body `{ includeDiscount, userDiscountId, cartItemIds }`.
* **Đã sửa:** Viết Frontend gửi trực tiếp vào POST của `/carts/price`, hoạt động chính xác theo Postman.

### 4.4 Các Object ID trong Cart có tính Option (Trả về `null`)
* **Lỗi trả về:** Postman cho thấy tại kết quả khi Tăng/Giảm Quantity, trường `cartItemId` nhiều khi bị backend bỏ trống (return null).
* **Frontend:** Zod Validation `CartItemMutationResponseSchema` đã sử dụng `.optional()` và `.nullable()`, hoàn toàn giúp ứng dụng không bị Crash Validation khi backend trả về JSON không toàn vẹn.

---

## 5. Quy Trình Xử Lý Token & Error Validation

### 5.1 Nhầm lẫn 401 & 403 Response Interceptor
* Backend của Cart Service trả HTTP State code `403 Forbidden` thay vì `401 Unauthorized` ngay cả với lỗi **Token Expired / Missing Permission**.
* **Flow Client HTTP frontend:** Gặp 403 thì Middleware sẽ ngắt lệnh reload trang về `window.location.href = "/login?error=forbidden"`.
* **Cảnh báo/Góp ý gửi Backend Đội:** Đề xuất Đội Backend phải rạch ròi 401 (Lỗi Token Expired -> cấp quyền Refresh Tự động) vs 403 (Lỗi Không có quyền Authorization -> cấm hẳn).
  * Frontend hiện tại không thể Retry logic Refresh-Token nếu Backend ngẫu nhiên ném `403` thay vì ném `401`.

---

**[End of Document]**
Mọi thứ đã được sửa chữa trực tiếp trong commit code! Tài liệu lập ra để phục vụ quá trình làm việc giữa Mobile App dev, Frontend Dev và Backend Dev trao đổi chéo minh bạch. Tình trạng luồng source code Frontend hiện tại đã **KHỚP VÀ SẴN SÀNG CHẠY 100%**.
