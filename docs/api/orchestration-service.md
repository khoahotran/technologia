# Orchestration Service API

Dịch vụ Orchestration chịu trách nhiệm điều phối các luồng nghiệp vụ phức tạp liên quan đến nhiều microservices, trọng tâm là quy trình Checkout và Order Saga.

## 1. Quy trình Checkout (Checkout Flow)

Quy trình checkout được thiết kế để đảm bảo tính nhất quán và hiệu năng cho Frontend.

### Bước 1: Khởi tạo Xem trước (Preview Init)
Khi người dùng nhấn "Mua hàng" từ giỏ hàng.
- **Endpoint**: `POST /api/checkout/preview/init`
- **Mô tả**: Tạo một `CheckoutSession` tạm thời, tính toán tổng tiền, phí ship và giảm giá.
- **Request (`CheckoutPreviewRequest`)**:
  ```json
  {
    "cartItemIds": ["UUID"],
    "voucherCode": "string" // Tùy chọn
  }
  ```
- **Response (`CheckoutPreviewResponse`)**:
  ```json
  {
    "checkoutSessionId": "UUID",
    "discountErrorMsg": "string",
    "defaultAddress": { "AddressResponse" },
    "items": [ "CartItemCheckoutResponse" ],
    "shippingFee": 0.0,
    "shippingDiscount": 0.0,
    "voucherDiscount": 0.0,
    "subTotal": 0.0,
    "totalPrice": 0.0,
    "defaultPaymentMethods": {
       "key": { "PaymentAccountResponse" }
    }
  }
  ```

### Bước 2: Tính toán lại (Recalculate)
Sử dụng khi người dùng thay đổi địa chỉ hoặc áp dụng mã giảm giá mới.
- **Endpoint**: `POST /api/checkout/recalculate`
- **Request (`CheckoutRecalculateRequest`)**:
  ```json
  {
    "checkoutSessionId": "UUID",
    "voucherCode": "string",
    "addressId": "UUID",
    "note": "string"
  }
  ```
- **Response (`CheckoutRecalculateResponse`)**: Cấu trúc tương tự Preview nhưng bao gồm trường `note` và đã cập nhật phí ship/voucher.

### Bước 3: Xác nhận Checkout (Confirm Checkout)
Bước cuối cùng để đặt hàng chính thức.
- **Endpoint**: `POST /api/checkout/confirm`
- **Request (`ConfirmCheckoutRequest`)**:
  ```json
  {
    "checkoutSessionId": "UUID",
    "paymentAccountId": "UUID", // Tùy chọn nếu dùng COD
    "paymentMethod": "E_WALLET | BANK_ACCOUNT | COD"
  }
  ```
- **Response**: Trả về `UUID` (orderId) vừa được tạo.

## 2. Quy trình Saga (Order Placement Saga)

Hệ thống sử dụng Saga Orchestration để đảm bảo tính nhất quán dữ liệu.

### Các bước trong Saga:

| Bước | Tên Step | Dịch vụ | Hành động | Trạng thái Order |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **CREATE_ORDER** | Order Service | Tạo đơn hàng mới | `AWAITING_CONFIRM` |
| 2 | **RESERVE_PRODUCT** | Product Service | Trừ tồn kho & Giữ hàng | `AWAITING_CONFIRM` |
| 3 | **CLEAR_CART** | Cart Service | Xóa các item khỏi giỏ | `AWAITING_CONFIRM` |

### Trạng thái Saga (`SagaStatus`):
- `STARTED`: Bắt đầu tiến trình.
- `PROCESSING`: Đang thực thi các bước.
- `COMPENSATING`: Đang chạy các bước bù đắp khi có lỗi.
- `COMPLETED`: Hoàn thành thành công.
- `FAILED`: Thất bại.
- `ABORTED`: Đã hủy.

## 3. Danh sách Topic Kafka:
- `order.commands` / `order.events`
- `product.commands` / `product.events`
- `cart.commands` / `cart.events`
