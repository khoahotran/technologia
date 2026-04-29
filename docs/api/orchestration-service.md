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

## 2. Quy trình Saga (Order Orchestration)

Hệ thống sử dụng mô hình **Saga Orchestrator** để điều phối các giao dịch phân tán.

### [NEW] Saga Hủy Đơn Hàng (Order Cancellation Saga)
Phối hợp việc hủy đơn và giải phóng tồn kho.
- **Endpoint**: `POST /api/sagas/cancel-order` (Protected)
- **Request (`CancelOrderRequest`)**:
  ```json
  {
    "orderId": "UUID",
    "sagaId": "UUID"
  }
  ```
- **Các bước thực hiện**:
  1. `CANCEL_ORDER`: Cập nhật trạng thái đơn hàng thành `CANCELED`.
  2. `RELEASE_PRODUCT`: Hoàn trả số lượng tồn kho cho các sản phẩm trong đơn.

---

### [NEW] Quy trình Thanh toán (Payment Saga)
Quản lý luồng thanh toán và cập nhật trạng thái đơn hàng.
- **Khởi tạo Thanh toán**: `POST /api/payments`
- **Request (`CreatePaymentRequest`)**:
  ```json
  {
    "orderId": "UUID",
    "sagaId": "UUID"
  }
  ```
- **Mô phỏng Thanh toán (Testing)**:
  - `POST /api/payments/simulate`: Giả lập thanh toán thành công.
  - `POST /api/payments/simulate/cancel`: Giả lập thanh toán thất bại.

---

### [NEW] Truy vấn Trạng thái Saga (Saga Monitoring)
Theo dõi tiến độ của một quy trình Saga.

#### Lấy thông tin Saga Instance
- **Endpoint**: `GET /api/sagas/instance/{sagaId}`
- **Response**: Chi tiết về `SagaStatus`, các bước đã thực hiện (`SagaStep`), và thời gian bắt đầu/kết thúc.

#### Lấy thông tin Đơn hàng từ Saga
- **Endpoint**: `GET /api/sagas/order/{sagaId}`
- **Response**: Trả về thông tin `OrderResponse` gắn liền với Saga Instance đó.

---

## 3. Trạng thái & Topic Kafka

### Trạng thái Saga (`SagaStatus`):
- `STARTED`: Bắt đầu tiến trình.
- `PROCESSING`: Đang thực thi các bước.
- `COMPENSATING`: Đang chạy các bước bù đắp khi có lỗi.
- `COMPLETED`: Hoàn thành thành công.
- `FAILED`: Thất bại.
- `ABORTED`: Đã hủy.

### Danh sách Topic Kafka chính:
- `order.commands` / `order.events`: Xử lý đơn hàng.
- `product.commands` / `product.events`: Quản lý tồn kho/giữ hàng.
- `cart.commands` / `cart.events`: Xử lý giỏ hàng.
- `payment.commands` / `payment.events`: [NEW] Xử lý thanh toán.
- `create.admin.action.logs`: [NEW] Gửi log cho Admin Service.

---

## 4. Analytical Reporting (Admin Only)

These APIs aggregate data from multiple services to provide analytical insights.

### Get Last 12 Months Revenue
#### 1. Overview
- Purpose: Fetch revenue data for each month over the past year.
- Service: orchestration-service

#### 2. Endpoint
- `GET /api/orchestration/admin/report-details/monthly-revenue`

#### 3. Request
- Headers: `Authorization: Bearer <token>`

#### 4. Response
- Success: `BaseResponse<List<MonthlyRevenueResponse>>`
```json
{
  "status": 200,
  "message": "Get monthly revenue successfully",
  "data": [
    {
      "month": "JANUARY",
      "revenue": 50000.00
    },
    ...
  ]
}
```

#### 5. Business Logic Notes
- Orchestrates a call to the Order Service to fetch revenue data aggregated by month.

#### 6. Dependencies / Data Flow
- Order Service (`GET /api/orders/reports/monthly-revenue`).

---

### Get Top Selling Products
#### 1. Overview
- Purpose: Fetch the top selling products across the system.
- Service: orchestration-service

#### 2. Endpoint
- `GET /api/orchestration/admin/report-details/top-selling-products/{limit}`

#### 3. Request
- Headers: `Authorization: Bearer <token>`
- Path Params: `limit` (int) - Number of top products to retrieve.

#### 4. Response
- Success: `BaseResponse<List<TopSellingProductResponse>>`
```json
{
  "status": 200,
  "message": "Get top selling products successfully",
  "data": [
    {
      "productId": "uuid...",
      "productName": "iPhone 15 Pro",
      "totalSold": 150
    },
    ...
  ]
}
```

#### 5. Business Logic Notes
- Fetches top selling data from Order Service.
- For products with missing names, it performs a lookup in the Product Service.

#### 6. Dependencies / Data Flow
- Order Service (`GET /api/orders/reports/top-selling-products`).
- Product Service (`GET /api/products/{productId}/name`).
