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

## Shipping (Order Service)

### Get Shipping Fee
`GET /api/shipping-fee`

**QueryParams:**
- `province` (String)
- `subTotal` (BigDecimal)

**Response:** `ShippingFeeResponse`
- `shippingFee` (BigDecimal)
- `shippingFeeDiscount` (BigDecimal)
