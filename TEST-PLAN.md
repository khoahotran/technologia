# Test Plan - Technologia E-commerce

## 1. Store/Logic (Unit Test)

| Tên Component/File | Loại Test | Kịch bản chính cần phủ | Độ ưu tiên |
|---|---|---|---|
| `src/store/cart.store.ts` | Unit | addItem tăng quantity khi đã tồn tại; removeItem xóa đúng item; updateQuantity; getTotal tính tổng tiền; getItemCount | **High** |
| `src/store/auth.store.ts` | Unit | setSession lưu token; clearSession xóa; isAuthenticated check valid token | **High** |
| `src/store/order-flow.store.ts` | Unit | setShippingAddress; setPaymentMethod; getTotal tính toán với shipping | **High** |
| `src/store/ui.store.ts` | Unit | toggleCartDrawer; setLoading; toast management | **Medium** |
| `src/store/wishlist.store.ts` | Unit | addToWishlist; removeFromWishlist; checkInWishlist | **Low** |

---

## 2. Formatters (Unit Test)

| Tên Component/File | Loại Test | Kịch bản chính cần phủ | Độ ưu tiên |
|---|---|---|---|
| `src/utils/format.ts` | Unit | formatCurrency VND→"100.000 ₫"; formatNumber 1000→"1.000"; formatDate ISO→"DD/MM/YYYY"; Xử lý null/undefined | **High** |
| `src/utils/cn.ts` | Unit | Kết hợp className conditional đúng | **Low** |

---

## 3. UI Components - Core Flow (Integration Test)

| Tên Component/File | Loại Test | Kịch bản chính cần phủ | Độ ưu tiên |
|---|---|---|---|
| `src/components/features/cart/CartItem.tsx` | Integration | Render item name/price/quantity; Nhấn +/- gọi updateQuantity; Nhấn Xóa gọi removeItem | **High** |
| `src/components/features/cart/CartSummary.tsx` | Integration | Hiển thị subtotal/shipping/total đúng; Nhấn Checkout chuyển route | **High** |
| `src/components/ui/product-card.tsx` | Integration | Render hình/tên/giá; Nhấn "Thêm vào giỏ" gọi addToCart | **High** |
| `src/components/features/product/ProductInfo.tsx` | Integration | Render thông tin sản phẩm; Chọn variant; Nhấn Add to Cart | **High** |
| `src/components/features/checkout/AddressForm.tsx` | Integration | Validate required fields; Submit gọi API; Error hiển thị | **Medium** |
| `src/components/features/checkout/PaymentMethodList.tsx` | Integration | Render danh sách payment methods; Chọn method cập nhật state | **Medium** |

---

## 4. Chatbot Lạc Lạc (Integration Test)

| Tên Component/File | Loại Test | Kịch bản chính cần phủ | Độ ưu tiên |
|---|---|---|---|
| `src/components/features/Chatbot.tsx` | Integration | Toggle mở/đóng cửa sổ; Render tin nhắn welcome; Gửi tin nhắn hiển thị; Click quick question; Auto-response theo keyword; Minimize/Restore | **High** |

---

## 5. Shared Components (Integration Test)

| Tên Component/File | Loại Test | Kịch bản chính cần phủ | Độ ưu tiên |
|---|---|---|---|
| `src/components/ui/button.tsx` | Integration | Render đúng variant; Disabled state; Loading state | **Medium** |
| `src/components/ui/quantity-selector.tsx` | Integration | Tăng/giảm số lượng; Limit min=1,max=100 | **Medium** |
| `src/components/ui/price-display.tsx` | Integration | Render giá gốc/giảm giá đúng format; Sale badge | **Medium** |
| `src/components/ui/input.tsx` | Integration | Nhập liệu; Error state; Disabled state | **Low** |

---

## 6. Chiến lược Mocking

| Điểm cần Mock | Cách mock | Ghi chú |
|---|---|---|
| `src/api/client.ts` (Axios) | Dùng `vi.mock()` tạo mock trả về JSON data giả lập | Không gọi API thật |
| TanStack Query | Bọc component trong `<QueryClientProvider>` với client mới | Mock queryClient cho mỗi test |
| Zustand stores | Không cần mock - test trực tiếp qua hook | Dùng renderHook từ RTL |
| Biến môi trường | Mock trong `vitest.setup.ts` | Gán giá trị mặc định |

---

## 7. Test Case Priority (ăn điểm với hội đồng)

### Ưu tiên 1 - Core E-commerce Flow
- addToCart/removeFromCart trong cart.store.ts
- formatCurrency/formatNumber/formatDate trong format.ts
- CartItem render + tương tác
- ProductCard render + Add to Cart

### Ưu tiên 2 - Chatbot Lạc Lạc
- Chatbot mở/đóng
- Gửi tin nhắn hiển thị đúng
- Quick questions hoạt động
- Auto-response theo keyword

### Ưu tiên 3 - Shared Components
- Button variants
- QuantitySelector +/- limits
- PriceDisplay giảm giá

---

## 8. Quy tắc cốt lõi

- Dùng `vi.fn()` thay vì `jest.fn()`
- Mock Axios qua `vi.mock('@/api/client')`
- Bọc component trong `<QueryClientProvider>` khi dùng TanStack Query
- Test behavior: render đúng → data hiển thị đúng → tương tác gọi function đúng số lần