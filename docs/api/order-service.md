# Ordering & Checkout API Documentation

The Ordering and Checkout process is managed by the Orchestration Service (for checkout orchestration) and the Order Service (for order storage and queries). The actual order creation is an asynchronous process triggered by confirming a checkout.

## Checkout (Orchestration Service)

### Initialize Checkout Preview
`POST /api/checkout/preview/init` (Protected)

Starts the checkout process for selected cart items and returns a preview of the order, including totals and default shipping/payment info.

**Request Body:** `CheckoutPreviewRequest`
- `cartItemIds` (List<UUID>)
- `voucherCode` (String, Optional)

**Response:** `BaseResponse<CheckoutPreviewResponse>`
- `CheckoutPreviewResponse`:
    - `checkoutSessionId` (UUID) - Used for subsequent recalculations and confirmation.
    - `discountErrorMsg` (String)
    - `defaultAddress` (AddressResponse)
    - `items` (List<CartItemCheckoutResponse>)
    - `shippingFee` (BigDecimal)
    - `shippingDiscount` (BigDecimal)
    - `voucherDiscount` (BigDecimal)
    - `subTotal` (BigDecimal)
    - `totalPrice` (BigDecimal)
    - `defaultPaymentMethods` (Map<String, PaymentAccountResponse>)

---

### Recalculate Checkout
`POST /api/checkout/recalculate` (Protected)

Recalculates the checkout totals when the user changes the shipping address, applies a voucher, or adds a note.

**Request Body:** `CheckoutRecalculateRequest`
- `checkoutSessionId` (UUID)
- `voucherCode` (String)
- `addressId` (UUID)
- `note` (String)

**Response:** `BaseResponse<CheckoutRecalculateResponse>`
- `CheckoutRecalculateResponse`:
    - `checkoutSessionId` (UUID)
    - `discountErrorMsg` (String)
    - `items` (List<CartItemCheckoutResponse>)
    - `shippingFee` (BigDecimal)
    - `shippingDiscount` (BigDecimal)
    - `voucherDiscount` (BigDecimal)
    - `subTotal` (BigDecimal)
    - `totalPrice` (BigDecimal)
    - `note` (String)

---

### Confirm Checkout
`POST /api/checkout/confirm` (Protected)

Finalizes the checkout and creates the order. This is an asynchronous operation.

**Request Body:** `ConfirmCheckoutRequest`
- `checkoutSessionId` (UUID)
- `paymentAccountId` (UUID)
- `paymentMethod` (Enum: `E_WALLET`, `BANK_ACCOUNT`, `COD`)

**Response:** `BaseResponse<UUID>` (Order ID)

## Order Queries (Order Service)

### Get All Orders of User
`GET /api/orders` (Protected)

**QueryParams:** `BasePaginationRequest`

**Response:** `PaginationBaseResponse<List<OrderResponse>>`
- `OrderResponse`:
    - `orderId` (UUID)
    - `orderDate` (String)
    - `totalAmount` (BigDecimal)
    - `deliveryStatus` (String)
    - `paymentMethod` (String)
    - `paymentAccountId` (UUID)
    - `addressId` (UUID)
    - `customerId` (UUID)
    - `updatedAt` (String)
    - `items` (List<OrderItemResponse>)

---

### Get Order by ID
`GET /api/orders/{orderId}` (Protected)

**Path Variable:** `orderId` (UUID)

**Response:** `BaseResponse<OrderResponse>`

---

### Get Orders by Delivery Status
`GET /api/orders/by-delivery-status` (Protected)

**QueryParams:**
- `deliveryStatus` (Enum: `PENDING`, `SHIPPING`, `DELIVERED`, `CANCELLED`, etc.)
- Pagination parameters (`BasePaginationRequest`)

**Response:** `PaginationBaseResponse<List<OrderResponse>>`

## 3. Product Feedback (Order Service)

Người dùng có thể đánh giá và để lại bình luận cho từng sản phẩm đã mua sau khi đơn hàng hoàn tất.

### Gửi Đánh giá (Give Feedback)
- **Endpoint**: `POST /api/orders/feedback` (Protected)
- **Request (`GiveFeedbackRequest`)**:
  ```json
  {
    "orderItemId": "UUID",
    "rating": 5, // 1 - 5
    "comment": "Sản phẩm rất tốt"
  }
  ```
- **Response**: `BaseResponse<FeedbackResponse>`

### Truy vấn Đánh giá (Get Feedback)
- **Lấy đánh giá theo Sản phẩm (Công khai)**:
    - **Endpoint**: `GET /api/orders/feedback/product/{productId}`
    - **Mô tả**: Lấy danh sách đánh giá của một sản phẩm (phân trang).
    - **QueryParams**: `page`, `size`, `sortBy`, `sortDirection`.
    - **Response**: `PaginationBaseResponse<List<OrderFeedbackResponse>>`
- **Lấy đánh giá theo Đơn hàng (Cá nhân)**:
    - **Endpoint**: `GET /api/orders/feedback/{orderId}` (Protected)
    - **Mô tả**: Lấy danh sách đánh giá mà người dùng đã thực hiện cho một đơn hàng cụ thể.
    - **Response**: `BaseResponse<List<OrderFeedbackResponse>>`

### Cập nhật/Xóa Đánh giá
- `PUT /api/orders/feedback/{orderItemId}`: Cập nhật nội dung đánh giá.
- `DELETE /api/orders/feedback/{orderItemId}`: Xóa đánh giá.

---

## 4. Nhật ký Giao hàng (Delivery Logs)

Theo dõi lịch sử vận chuyển và thay đổi trạng thái của đơn hàng.

### Xem Nhật ký Giao hàng
- **Endpoint**: `GET /api/delivery-logs/order/{orderId}` (Protected)
- **Response**: `BaseResponse<List<DeliveryLogResponse>>`
  - Mỗi log bao gồm: `deliveryLogId`, `orderId`, `status`, `message`, `createdAt`.

---

## 5. Quản trị Đơn hàng (Admin APIs)

Các API dành riêng cho quản trị viên để điều phối đơn hàng và vận chuyển.

### Cập nhật Trạng thái Đơn hàng (Admin)
- **Endpoint**: `PATCH /api/orders/admin/{orderId}/status` (Protected)
- **Request (`UpdateOrderStatusRequest`)**:
  ```json
  {
    "newStatus": "PENDING | ON_SHIPPING | DELIVERED | CANCELED"
  }
  ```

### Quản lý Nhật ký Giao hàng (Admin)
- `POST /api/orders/admin/{orderId}/create-delivery-log`: Tạo bước giao hàng mới.
- `PUT /api/orders/admin/{deliveryLogId}/update-delivery-log`: Sửa thông tin log.
- `DELETE /api/orders/admin/{deliveryLogId}/delete-delivery-log`: Xóa log.

### Truy vấn Đơn hàng (Admin)
- `GET /api/orders/admin/{orderId}`: Xem chi tiết bất kỳ đơn hàng nào.
- `GET /api/orders/admin`: Admin list with optional `status` and `BasePaginationRequest` (`page`, `size`, `sortBy`, `sortDirection`).

---

## 6. Topic Kafka & Trạng thái

### DeliveryStatus (Trạng thái Đơn hàng)
- `AWAITING_PAYMENT`, `AWAITING_CONFIRM`, `PENDING`, `ON_SHIPPING`, `DELIVERED`, `CANCELED`.

### Kafka Events
- `order.create.feedback`: Phát ra khi có đánh giá mới (Product Service sẽ lắng nghe để cập nhật rating sản phẩm).
- `create.delivery.log`: Phát ra để cập nhật lịch sử vận chuyển.
