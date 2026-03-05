import {
    CartItem,
    CartMap,
    AddToCartPayload,
    CalculatePricePayload,
    CartItemActionResponse,
} from "../entities/cart.entity";

/**
 * Các tham số dùng để yêu cầu danh sách Giỏ hàng có phân trang.
 */
export interface CartPagingParams {
    /** Chỉ mục trang (thường bắt đầu từ 0) */
    page?: number;
    /** Số lượng phần tử mỗi trang */
    size?: number;
    /** Hướng sắp xếp (Tăng dần - ASC hoặc Giảm dần - DESC) */
    sortDir?: "ASC" | "DESC";
    /** Tên trường dưa dữ liệu dùng làm tiêu chí sắp xếp */
    sortBy?: string;
}

/**
 * Giao diện Repository (Contract) cho việc quản lý Giỏ hàng.
 * Định nghĩa các phương thức giao tiếp với Cart Service (Port 8083).
 */
export interface ICartRepository {
    /**
     * Lấy toàn bộ thông tin giỏ hàng hiện tại.
     * @param page Chỉ mục trang nếu giỏ hàng hỗ trợ phân trang.
     * @param size Số lượng item tối đa mỗi trang.
     */
    getCart(page?: number, size?: number): Promise<CartMap>;

    /**
     * Thêm một sản phẩm mới (hoặc biến thể) vào giỏ hàng.
     */
    addToCart(payload: AddToCartPayload): Promise<void>;

    /**
     * Tăng số lượng của một mục trong giỏ hàng lên 1 unit
     */
    increase(cartItemId: string): Promise<CartItemActionResponse>;

    /**
     * Giảm số lượng của một mục trong giỏ hàng xuống 1 unit
     */
    decrease(cartItemId: string): Promise<CartItemActionResponse>;

    /**
     * Xóa một mục ra khỏi giỏ hàng.
     */
    remove(cartItemId: string): Promise<void>;

    /**
     * Lấy thông tin chi tiết một item trong giỏ.
     */
    getCartItem(cartItemId: string): Promise<CartItem>;

    /**
     * Cập nhật số lượng của một mục sản phẩm đã có trong giỏ.
     * @param cartItemId ID của bản ghi mục giỏ hàng (không phải productId).
     * @param quantity Số lượng mới cần thiết lập.
     */
    updateQuantity(cartItemId: string, quantity: number): Promise<void>;

    /**
     * Xóa một hoặc nhiều mục ra khỏi giỏ hàng.
     * @param cartItemIds Danh sách các mã mục giỏ hàng cần xóa.
     */
    removeFromCart(cartItemIds: string[]): Promise<void>;

    /**
     * Làm trống hoàn toàn giỏ hàng.
     */
    clearCart(): Promise<void>;

    /**
     * Tính toán tổng giá trị giỏ hàng (bao gồm giảm giá nếu có).
     */
    calculatePrice(payload: CalculatePricePayload): Promise<number>;
}
