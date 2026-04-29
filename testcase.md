# Frontend Test Cases (Next.js) - Updated theo API docs mới

## 0) Scope và Assumptions

- Scope: manual test case cho toàn bộ page/feature/component chính trong `src`.
- Source of truth: `docs/api/*.md` (đã cập nhật thêm admin APIs cho product/variant/report).
- FE hiện đã nối API cho:
  - Admin Brand/Category CRUD
  - Admin Product create/update/delete
  - Admin add variant
  - Admin apply products to discount
  - Admin report list + create monthly revenue/top-selling
- **UNKNOWN còn lại**: Admin action logs API chưa thấy endpoint public trong docs (`/admin/reports` page phần action logs vẫn mock UI).

---

## 1) Coverage Matrix theo page/feature

### 1.1 Global App
- Mục tiêu: app bootstrap, routing, error boundary, i18n, session persistence.
- Nhóm test: UI/render, navigation, state, error handling.

### 1.2 Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`)
- Mục tiêu: auth flow đúng contract.
- Nhóm test: validation, submit logic, error mapping, redirect.

### 1.3 Shop Core
- Pages: `/`, `/products`, `/products/[id]`, `/cart`, `/shipping` (`/checkout`), `/address-book`, `/profile`, `/about`.
- Mục tiêu: browsing -> cart -> shipping ổn định.
- Nhóm test: UI behavior, state, API interaction, edge cases.

### 1.4 Orders (Client)
- Pages: `/orders`, `/orders/[id]`, `/orders/[id]/feedback`.
- Mục tiêu: order list/detail/tracking/feedback đúng business logic.
- Nhóm test: status grouping, timeline, feedback constraints, failover.

### 1.5 Admin
- Pages: `/admin/home`, `/admin/products`, `/admin/orders`, `/admin/reports`.
- Mục tiêu: admin data flow theo API mới.
- Nhóm test: CRUD/filters/pagination/permissions/report generation.

---

## 2) Test Cases chi tiết

## A. Global / Core

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| GLOB-001 | App render root | App running | Mở `/` | Không crash, render đủ layout chính | High | UI |
| GLOB-002 | i18n switch vi/en | Ở page có language switch | Toggle ngôn ngữ | Text đổi theo locale, không lỗi hydration | High | Functional |
| GLOB-003 | 404 page | None | Vào route không tồn tại | Hiển thị `404` + link về Home | High | Negative |
| GLOB-004 | Error boundary fallback | Có lỗi runtime giả lập | Trigger lỗi component | Hiển thị error UI + nút retry hoạt động | Medium | Edge case |
| GLOB-005 | Persist auth session | User đã login | Refresh browser | Session giữ nguyên (token hợp lệ) | High | State |
| GLOB-006 | Session expired handling | Token hết hạn | Gọi API protected | FE logout + điều hướng login + toast phù hợp | High | Negative |

## B. Auth

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| AUTH-001 | Login local success | Account hợp lệ | Submit username/password | Login thành công, redirect `/` | High | Functional |
| AUTH-002 | Login local fail | Password sai | Submit form | Hiển thị lỗi đúng message | High | Negative |
| AUTH-003 | Register success (`/api/auth/register/local`) | Data hợp lệ | Submit register | Success toast + redirect login | High | Functional |
| AUTH-004 | Register password mismatch | None | Nhập confirm sai | Chặn submit, báo mismatch | High | Validation |
| AUTH-005 | Forgot password success | Email hợp lệ | Submit forgot form | Hiển thị success state/check email | Medium | Functional |
| AUTH-006 | Reset password dùng `resetToken` | Có link reset hợp lệ | Submit password mới | Thành công, redirect login | High | Functional |
| AUTH-007 | Reset password thiếu token | Mở `/reset-password` không token | Quan sát | Hiển thị invalid link state | High | Negative |

## C. Home / Product Browsing

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| HOME-001 | Home sections render | None | Mở `/` | Banner, TopProducts, HotProducts, Subscribe hiển thị | Medium | UI |
| PROD-001 | Product list load (`search-filter`) | API up | Mở `/products` | Render grid + pagination | High | Functional |
| PROD-002 | Filter theo category/brand/min-max/sort | None | Đổi filter | URL query cập nhật + data refresh đúng | High | Functional |
| PROD-003 | Product empty state | Điều kiện filter không có data | Áp filter | Hiển thị empty state | Medium | Edge case |
| PROD-004 | Product detail load | ID hợp lệ | Mở `/products/{id}` | Render image/tabs/price/related | High | UI |
| PROD-005 | Product detail not found | ID không tồn tại | Mở page | Điều hướng not-found đúng | High | Negative |
| PROD-006 | Add to cart từ list/detail | User login + product có variant | Click add | Thành công + toast + cart refresh | High | Functional |

## D. Cart / Shipping / Address

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| CART-001 | Cart list + total render | Cart có item | Mở `/cart` | Render item, total đúng theo selected items | High | Functional |
| CART-002 | Select all / select item | Cart có nhiều item | Toggle checkbox | State selected + total cập nhật đúng | High | Logic |
| CART-003 | Quantity +/- optimistic | Có item | Tăng/giảm qty | UI cập nhật ngay, sync lại theo server | Medium | State |
| CART-004 | Remove selected | Chọn nhiều item | Click REMOVE | Item bị xoá, toast success | High | Functional |
| SHIP-001 | Shipping open từ cart | Có selected IDs | Click checkout | Mở `/shipping?items=...` đúng | High | Flow |
| SHIP-002 | Place order validation address | Không có address active | Click Place order | Chặn submit + toast chọn/tạo address | High | Validation |
| SHIP-003 | Place order validation payment account | Chọn BANK/E_WALLET chưa chọn account | Place order | Chặn submit + toast phù hợp | High | Validation |
| SHIP-004 | Place order success | Data đủ | Place order | Redirect `/orders/{orderId}` | High | Flow |
| ADDR-001 | Address list + use address | Có addresses | Click Use address | Điều hướng về shipping với `addressId` | High | Functional |
| ADDR-002 | Create address required fields | None | Bỏ field bắt buộc rồi save | Chặn submit + toast lỗi | High | Validation |
| ADDR-003 | Create address success | Data hợp lệ | Save | Tạo xong, quay lại address book | High | Functional |

## E. Orders (Client)

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| ORD-001 | Orders grouping theo delivery status | Có data nhiều status | Mở `/orders` | Đơn vào đúng cột Created/Shipping/Delivered/Cancelled | High | Logic |
| ORD-002 | Orders load fail UI | Mock API fail | Mở `/orders` | Hiện thông báo lỗi + link back | High | Negative |
| ORD-003 | Track order by input | Ở page tracking | Nhập orderId + Track | Điều hướng `/orders/{id}` | Medium | Functional |
| ORD-004 | Delivery logs timeline | API logs trả dữ liệu | Mở order detail | Timeline render theo logs | High | Functional |
| ORD-005 | Fallback timeline khi logs lỗi | Force logs API fail | Mở order detail | Fallback theo `deliveryStatus` + warning text | High | Edge case |
| ORD-006 | Feedback enable rule | So sánh delivered vs non-delivered | Quan sát nút feedback | Chỉ enable cho order delivered | High | Business logic |
| FB-001 | Feedback submit thành công | Order delivered + có orderItemId | Điền rating/comment và submit | Submit thành công, clear drafts | High | Functional |
| FB-002 | Feedback comment bắt buộc | Để trống comment 1 item | Submit | Chặn submit + toast yêu cầu comment | High | Validation |
| FB-003 | Feedback thiếu orderItemId | Response thiếu item id | Submit | Chặn submit + toast lỗi contract | High | Edge case |

## F. Admin Home (Brand/Category CRUD)

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| ADM-HOME-001 | Load brand/category list | API up | Mở `/admin/home` | Danh sách brands/categories render đúng | High | Functional |
| ADM-HOME-002 | Create brand (`POST /api/brands/admin`) | User có quyền admin | Add brand -> nhập name | Tạo thành công, list refresh/invalidate | High | Functional |
| ADM-HOME-003 | Update brand (`PATCH /api/brands/admin/{id}`) | Có brand | Edit brand -> đổi name | Cập nhật thành công, list đổi theo | High | Functional |
| ADM-HOME-004 | Delete brand (`DELETE /api/brands/admin/{id}`) | Có brand | Delete -> confirm | Xoá thành công, item biến mất | High | Functional |
| ADM-HOME-005 | Create category (`POST /api/categories/admin`) | Admin role | Add category | Thành công, list refresh | High | Functional |
| ADM-HOME-006 | Update category (`PATCH /api/categories/admin/{id}`) | Có category | Edit -> save | Thành công | High | Functional |
| ADM-HOME-007 | Delete category (`DELETE /api/categories/admin/{id}`) | Có category | Delete -> confirm | Thành công | High | Functional |
| ADM-HOME-008 | Permission check cho non-admin | User thường | Thử create/update/delete | Bị chặn (403 hoặc route guard FE) | High | Permission |

## G. Admin Products (create/update/delete/variant/discount)

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| ADM-PROD-001 | Product grid load + filter | API up | Mở `/admin/products`, đổi filter | Data load đúng theo filter | High | Functional |
| ADM-PROD-002 | Create product (`POST /api/products/admin`) | Admin role + có brand/category | Click Add product -> nhập prompt | Tạo product thành công, list refresh | High | Functional |
| ADM-PROD-003 | Update product (`PUT /api/products/admin/{id}`) | Có product | Action Edit -> nhập thông tin | Cập nhật thành công, list cập nhật | High | Functional |
| ADM-PROD-004 | Delete product (`DELETE /api/products/admin/{id}`) | Có product | Action Remove -> confirm | Xoá thành công, list refresh | High | Functional |
| ADM-PROD-005 | Add variant (`POST /api/products/admin/{id}/variant`) | Có product | Action Apply -> nhập variant prompt | Variant tạo thành công | High | Functional |
| ADM-PROD-006 | Multi select logic | Có nhiều product tiles | Tick nhiều tile + Select all page | Selection count đúng | High | Logic |
| ADM-PROD-007 | Apply discount (`PUT /api/discounts/admin/{discountId}/apply-products`) | Có selected IDs + discount id | Click Apply Discount -> nhập discountId | API gọi thành công | High | Functional |
| ADM-PROD-008 | Validation khi thiếu brand/category fallback | Không có brand/category data | Click Add product | Chặn submit + báo lỗi | Medium | Validation |
| ADM-PROD-009 | Permission check non-admin | User thường | Thực hiện action admin | 403 hoặc bị chặn UI | High | Permission |

## H. Admin Orders

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| ADM-ORD-001 | Load admin orders (`GET /api/orders/admin`) | Admin role | Mở `/admin/orders` | Orders render theo các nhóm status | High | Functional |
| ADM-ORD-002 | Track order by ID (admin detail) | Có order ID | Nhập ID + Track | Lấy detail và hiển thị trong grouping | High | Functional |
| ADM-ORD-003 | Empty order id validation | None | Track khi input rỗng | Toast validation | Medium | Validation |
| ADM-ORD-004 | API fail handling | Mock fail | Mở page | Hiển thị lỗi không crash | High | Negative |

## I. Admin Reports

| ID | Test case | Preconditions | Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|---|
| ADM-REP-001 | List reports (`GET /api/admins/reports`) | Endpoint accessible | Mở `/admin/reports` | Bảng reports load theo page/size/sort | High | Functional |
| ADM-REP-002 | Filter report type | Có data nhiều type | Chọn filter type | Danh sách chỉ còn type tương ứng | High | Functional |
| ADM-REP-003 | Search keyword (client side) | Có report data | Nhập keyword | Bảng lọc theo reportId/name | Medium | Functional |
| ADM-REP-004 | Create monthly revenue report (`POST /api/admins/reports/monthly-revenue`) | Admin role hoặc endpoint mở | Click create monthly report | Tạo report thành công + list refresh | High | Functional |
| ADM-REP-005 | Create top selling report (`POST /api/admins/reports/top-selling-products`) | Admin role hoặc endpoint mở | Click create top-selling report | Tạo report thành công + list refresh | High | Functional |
| ADM-REP-006 | Pagination controls reports | totalPages > 1 | Click Prev/Next/Page | Query page đổi đúng, data cập nhật | Medium | Functional |
| ADM-REP-007 | Action logs block | None | Xem block action logs | Hiển thị `UNKNOWN` notice rõ ràng | Medium | UI |

---

## 3) API-focused Regression Set (ưu tiên chạy sau mỗi update contract)

- AUTH: AUTH-001, AUTH-003, AUTH-006
- SHOP: PROD-001, SHIP-004
- ORDER CLIENT: ORD-001, ORD-004, FB-001
- ADMIN HOME: ADM-HOME-002/003/004/005/006/007
- ADMIN PRODUCT: ADM-PROD-002/003/004/005/007
- ADMIN REPORT: ADM-REP-001/002/004/005

---

## 4) Risks / Notes cần theo dõi

1. Admin action logs API chưa public trong docs -> giữ `UNKNOWN`.
2. Route guard admin ở FE cần xác nhận thêm (nếu không có middleware guard thì non-admin vẫn có thể vào URL trực tiếp).
3. Một số thao tác admin đang dùng prompt input nhanh để thao tác API (cần test kỹ input xấu/rỗng).
4. i18n cho một số toast hệ thống vẫn còn text mặc định EN -> cần regression khi switch locale.
