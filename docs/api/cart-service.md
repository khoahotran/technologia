# Cart Service API Documentation

The Cart Service manages shopping carts for users. It allows adding products, changing quantities, deleting items, and calculating the total price (including optional discounts). It is a protected service requiring authentication.

## Cart Management

### Get Cart by User ID
`GET /api/carts` (Protected)

Retrieves the current user's shopping cart.

**Response:** `BaseResponse<CartDetail>`
- `CartDetail`:
    - `cartId` (UUID)
    - `customerId` (String)
    - `updatedAt` (String)
    - `cartItems` (List<CartItemDetail>)
    - `totalItems` (int)
    - `pageSize` (int)
    - `currentPage` (int)

---

### Get Cart with Paging
`GET /api/carts/with-items-paging` (Protected)

Retrieves the current user's cart items with pagination.

**QueryParams:** `BasePaginationRequest`

**Response:** `BaseResponse<CartDetail>`

---

### Get Cart Item by ID
`GET /api/carts/item/{id}` (Protected)

**Path Variable:** `id` (UUID)

**Response:** `BaseResponse<CartItemDetail>`
- `CartItemDetail`:
    - `cartItemId` (UUID)
    - `productId` (UUID)
    - `variantId` (String)
    - `addAt` (String)
    - `updateAt` (String)
    - `currentQuantity` (int)
    - `name` (String)
    - `color` (String)
    - `price` (BigDecimal)
    - `priceAfterDiscount` (BigDecimal)
    - `inStock` (int)
    - `mainImage` (String)

---

### Add Product to Cart
`POST /api/carts/add-to-cart` (Protected)

**Request Body:** `AddProductToCartRequest`
- `productId` (UUID)
- `variantId` (String)

**Response:** `BaseResponse<AddProductToCartResponse>`
- `AddProductToCartResponse`:
    - `cartItemId` (UUID)
    - `productId` (UUID)
    - `variantId` (String)
    - `quantityInCart` (int)
    - `quantityInStock` (int)

---

### Increase Cart Item Quantity
`PATCH /api/cart-items/increase/{itemId}` (Protected)

**Path Variable:** `itemId` (UUID)

**Response:** `BaseResponse<ChangeItemQuantityResponse>`
- `ChangeItemQuantityResponse`:
    - `cartItemId` (UUID)
    - `quantityInCart` (int)
    - `quantityInStock` (int)

---

### Decrease Cart Item Quantity
`PATCH /api/cart-items/decrease/{itemId}` (Protected)

**Path Variable:** `itemId` (UUID)

**Response:** `BaseResponse<ChangeItemQuantityResponse>`

---

### Delete Cart Item
`DELETE /api/cart-items/delete/{itemId}` (Protected)

**Path Variable:** `itemId` (UUID)

---

### Get Cart Total Price
`POST /api/carts/price` (Protected)

Calculates the total price for selected cart items, optionally applying a discount.

**Request Body:** `CountPriceRequest`
- `includeDiscount` (boolean)
- `userDiscountId` (UUID) - ID of the discount/voucher to apply.
- `cartItemIds` (List<UUID>)

**Response:** `BaseResponse<CountPriceResponse>`
- `CountPriceResponse`:
    - `totalPrice` (BigDecimal) - Final total price after discount.
    - `totalDiscount` (BigDecimal) - Total discount amount.
    - `priceResponse` (List<PriceResponse>): Detailed price breakdown for each item.
        - `productId` (UUID)
        - `variantId` (String)
        - `price` (BigDecimal) - Original price.
        - `quantity` (Integer)
        - `canUseDiscount` (Boolean) - Whether discount is applied to this item.
        - `discountValue` (BigDecimal) - Discount amount for this item.
        - `finalPrice` (BigDecimal) - Final price for this item.

---

### Get List Cart Items by IDs
`POST /api/cart-items/by-ids` (Protected)

Retrieves details for a list of cart item IDs.

**Request Body:** `List<UUID>`

**Response:** `List<CartItemDetail>`
