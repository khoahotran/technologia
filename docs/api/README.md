# Tài liệu API Dự án E-Commerce

Chào mừng bạn đến với tài liệu kỹ thuật API cho dự án E-Commerce Microservices. Tài liệu này được chia theo từng dịch vụ (service) để tăng tính tổ chức và dễ dàng tra cứu.

## 📂 Kiến trúc Hệ thống (Service Architecture)

Hệ thống bao gồm các dịch vụ chính sau:
- **API Gateway**: Cổng điều phối các request từ client.
- **Orchestration Service**: Điều phối luồng nghiệp vụ Checkout và Order Saga.
- **Order Service**: Quản lý thông tin đơn hàng và trạng thái giao hàng.
- **Product Service**: Quản lý danh mục sản phẩm, biến thể (variant) và kho hàng (inventory).
- **Cart Service**: Quản lý giỏ hàng của người dùng.
- **User Service**: Quản lý thông tin người dùng, địa chỉ và tài khoản thanh toán.

---

## 🚀 Hướng dấn chung

### API Gateway
Tất cả các yêu cầu từ Frontend phải được gửi đến API Gateway tại: `http://localhost:8080`.

### Chuẩn phản hồi (BaseResponse)
Tất cả các API đều tuân thủ cấu trúc chuẩn:
```json
{
  "status": 200,
  "message": "...",
  "data": { ... }
}
```

### Phân trang (Pagination)
Các API trả về danh sách có phân trang sẽ theo định dạng `PaginationBaseResponse`:
```json
{
  "status": 200,
  "page_number": 0,
  "page_size": 10,
  "count_items": 100,
  "count_pages": 10,
  "data": [ ... ],
  "message": "Success"
}
```

---

## 📄 Danh sách Tài liệu Service

- [**User Service**](./user-service.md): Xác thực, Thông tin người dùng, Địa chỉ và Tài khoản thanh toán.
- [**Product Service**](./product-service.md): Danh mục sản phẩm, Tìm kiếm, Lọc, Thương hiệu và Giảm giá.
- [**Cart Service**](./cart-service.md): Quản lý Giỏ hàng và tính toán giá tạm thời.
- [**Order Service**](./order-service.md): Lịch sử đơn hàng, Theo dõi đơn hàng và Phí vận chuyển.
- [**Orchestration Service**](./orchestration-service.md): Quy trình Checkout và Order Saga Orchestration.

---
*Tài liệu được biên soạn bởi Antigravity Technical Documentation Agent.*
