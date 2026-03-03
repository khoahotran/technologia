/**
 * Định nghĩa Kiểu dữ liệu cho các Kho lưu trữ (Store Types)
 *
 * Tập trung các Interface và Type dùng cho Zustand stores.
 * Các kiểu dữ liệu này hoàn toàn độc lập, không phụ thuộc vào mock data hay repo.
 */

// ===========================================
// Auth Store Types - Trạng thái Xác thực
// ===========================================

/** Hồ sơ người dùng cơ bản lưu tại store */
export interface UserProfile {
    userId: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    imageUrl?: string;
    displayName?: string;
    role?: string;
}

/** Trạng thái dữ liệu của Auth Store */
export interface AuthState {
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/** Các hành động có thể thực hiện trên Auth Store */
export interface AuthActions {
    setUser: (user: UserProfile) => void;
    /** Đăng xuất: Xóa trắng user và đưa về trạng thái chưa xác thực */
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// ===========================================
// Cart Store Types - Trạng thái Giỏ hàng
// ===========================================

/** Một mục sản phẩm trong giỏ hàng */
export interface CartItem {
    productId: string;
    productName: string;
    price: number;
    /** URL hình ảnh (có thể không có) */
    image?: string | undefined;
    quantity: number;
    /** Thông tin biến thể (Màu sắc, kích cỡ...) */
    variantId?: string;
    variantName?: string;
}

/**
 * Dữ liệu tối thiểu cần truyền vào khi thêm item vào giỏ hàng.
 * Giúp gỡ bỏ sự phụ thuộc chặt chẽ vào Product Entity của Domain.
 */
export interface CartItemInput {
    id: string;
    name: string;
    price: number;
    image?: string | undefined;
}

export interface CartState {
    items: CartItem[];
    isLoading: boolean;
}

export interface CartActions {
    /** Thêm sản phẩm hoặc tăng số lượng nếu đã tồn tại */
    addItem: (product: CartItemInput, quantity?: number) => void;
    /** Xóa hẳn sản phẩm khỏi giỏ */
    removeItem: (productId: string) => void;
    /** Ghi đè số lượng cho một sản phẩm */
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    /** Tính tổng tiền đơn hàng (Client-side) */
    getTotal: () => number;
    /** Đếm tổng n sản phẩm trong giỏ */
    getItemCount: () => number;
}

export type CartStore = CartState & CartActions;

// ===========================================
// Wishlist Store Types - Trạng thái Danh sách yêu thích
// ===========================================

export interface WishlistState {
    /** Danh sách mảng chứa ID của các sản phẩm yêu thích */
    items: string[];
}

export interface WishlistActions {
    /** Đảo ngược trạng thái yêu thích (Thêm nếu chưa có, xóa nếu đã có) */
    toggle: (productId: string) => void;
    add: (productId: string) => void;
    remove: (productId: string) => void;
    /** Kiểm tra nhanh xem sản phẩm đã có trong list chưa */
    isInWishlist: (productId: string) => boolean;
    clear: () => void;
}

export type WishlistStore = WishlistState & WishlistActions;

// ===========================================
// Address Types - Địa chỉ nhận hàng
// ===========================================

/** Cấu trúc địa chỉ rút gọn dùng cho UI/Store */
export interface StoreAddress {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    ward: string;
    street: string;
    no: string;
    note?: string;
    isDefault: boolean;
}

export interface AddressState {
    addresses: StoreAddress[];
}

export interface AddressActions {
    addAddress: (address: Omit<StoreAddress, "id">) => void;
    updateAddress: (id: string, address: Partial<StoreAddress>) => void;
    deleteAddress: (id: string) => void;
    /** Đặt địa chỉ này làm mặc định và bỏ mặc định các cái khác */
    setDefaultAddress: (id: string) => void;
    getDefaultAddress: () => StoreAddress | undefined;
}

export type AddressStore = AddressState & AddressActions;

// ===========================================
// Order Types - Lịch sử Đơn hàng tạm thời
// ===========================================

export interface StoreOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
}

export interface CreateOrderPayload {
    items: StoreOrderItem[];
    shippingAddressId: string;
    paymentMethod: string;
    notes?: string;
}

export interface StoreOrder {
    id: string;
    orderNumber: string;
    items: StoreOrderItem[];
    total: number;
    subtotal: number;
    shipping: number;
    status: "created" | "paid" | "shipping" | "delivered" | "cancelled";
    createdAt: string;
    updatedAt: string;
    shippingAddress: StoreAddress;
    paymentMethod: "bank" | "ewallet" | "cod";
}

export interface OrderState {
    orders: StoreOrder[];
    isLoading: boolean;
}

export interface OrderActions {
    placeOrder: (payload: CreateOrderPayload) => void;
    getOrderById: (id: string) => StoreOrder | undefined;
}

export type OrderStore = OrderState & OrderActions;
