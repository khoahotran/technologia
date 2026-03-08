# Báo cáo Kiểm tra API (API Test Results)

**Thời gian kiểm tra**: 2026-03-08 19:55:00
**Gateway URL**: `http://localhost:8080`
**Tình trạng Gateway**: 🟢 Đang hoạt động (LISTENING)

## 📊 THỐNG KÊ CHI TIẾT

| Dịch vụ     | Endpoint                      | Phương thức | Kết quả       | Trạng thái (Status) | Ghi chú                                           |
| :---------- | :---------------------------- | :---------: | :------------ | :-----------------: | :------------------------------------------------ |
| **Auth**    | `/api/auth/login/local`       |   `POST`    | ❌ Lỗi        |       **500**       | Lỗi nội bộ backend khi đăng nhập.                 |
| **Auth**    | `/api/auth/register/local`    |   `POST`    | ❌ Lỗi        |       **500**       | Lỗi nội bộ backend khi đăng ký.                   |
| **Product** | `/api/products/paged`         |    `GET`    | ✅ Thành công |       **200**       | Trả về cấu trúc `BaseResponse` bọc.               |
| **Product** | `/api/brands`                 |    `GET`    | ✅ Thành công |       **200**       | Trả về **Mảng trực tiếp** (Direct Array).         |
| **Product** | `/api/categories`             |    `GET`    | ✅ Thành công |       **200**       | Trả về **Mảng trực tiếp** (Direct Array).         |
| **User**    | `/api/users/profile/me`       |    `GET`    | ⚠️ Chờ Token  |       **403**       | Gateway đã điều hướng tới service (yêu cầu Auth). |
| **Address** | `/api/addresses`              |    `GET`    | ⚠️ Chờ Token  |       **403**       | Gateway đã điều hướng tới service (yêu cầu Auth). |
| **Cart**    | `/api/carts`                  |    `GET`    | ⚠️ Chờ Token  |       **403**       | Gateway đã điều hướng tới service (yêu cầu Auth). |
| **Cart**    | `/api/cart-items/delete/{id}` |  `DELETE`   | ⚠️ Chờ Token  |       **403**       | Đã xác nhận cấu trúc path qua Gateway.            |

## 🛠️ PHÁT HIỆN VÀ KHUYẾN NGHỊ

### 1. Vấn đề Backend (Critical)

Dịch vụ Auth (`:8081` qua Gateway) đang gặp lỗi **500 Internal Server Error** cho cả Login và Register.

- Điều này ngăn cản việc lấy `accessToken` để kiểm tra các API bảo mật (Cart, Profile, Order).
- **Khuyến nghị**: Backend dev cần kiểm tra log của User Service để fix lỗi 500 này.

### 2. Đồng bộ Frontend

- **Gateway**: Frontend đã được refactor hoàn toàn sang port 8080 (`NEXT_PUBLIC_API_GATEWAY_URL`).
- **Proxy**: Các route trong `next.config.mjs` đã được gộp chung thành một quy tắc wildcard duy nhất, giúp gọi API mượt mà hơn.
- **Constants**: File `api.constants.ts` đã được cập nhật để ưu tiên biến môi trường Gateway mới.

### 3. Cấu trúc dữ liệu thực tế

Đã cập nhật tệp `backend-provided/document-generated.md` để phản ánh đúng việc `brands` và `categories` trả về List trực tiếp thay vì Wrapped Response.

---

**Kết luận**: Về phía Frontend, mọi cấu hình đã hoàn tất và tối ưu cho Gateway. Hệ thống sẽ hoạt động hoàn chỉnh ngay khi Backend xử lý xong lỗi 500 ở dịch vụ Auth.
