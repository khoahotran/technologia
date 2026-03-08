/**
 * Checkout Flow Use-Case
 *
 * Quản lý địa chỉ thanh toán và trạng thái đơn hàng tạm thời thông qua LocalStorage.
 * File này đóng vai trò lưu trữ trạng thái offline hoặc trạng thái trước khi gửi lên API thực tế.
 *
 * Trách nhiệm chính:
 * - Truy xuất / lưu trữ danh sách địa chỉ nhận hàng của người dùng.
 * - Truy xuất / lưu trữ lịch sử đơn hàng đã đặt (phục vụ trạng thái chờ hoặc offline).
 */

/** Cấu trúc dữ liệu cho một địa chỉ thanh toán */
export interface CheckoutAddress {
    /** UUID định danh địa chỉ */
    id: string;
    /** Họ tên người nhận */
    fullName: string;
    /** Số điện thoại liên lạc */
    phone: string;
    /** Địa chỉ chi tiết (số nhà, đường) */
    line: string;
    /** Phường/Xã */
    ward: string;
    /** Quận/Huyện/Thành phố thuộc tỉnh */
    city: string;
    /** Tỉnh/Thành phố trực thuộc TW */
    province: string;
    /** Ghi chú giao hàng (ví dụ: giao giờ hành chính) */
    note?: string;
    /** Đánh dấu đây là địa chỉ mặc định */
    isDefault: boolean;
}

/** Cấu trúc một item trong đơn hàng checkout */
export interface CheckoutOrderItem {
    /** ID mapping từ giỏ hàng */
    cartItemId: string;
    /** ID sản phẩm */
    productId: string;
    /** Biến thể sản phẩm (màu/size) */
    variantId?: string;
    /** Tên hiển thị */
    name: string;
    /** Ảnh đại diện sản phẩm */
    image?: string;
    /** Số lượng đặt */
    quantity: number;
    /** Đơn giá tại thời điểm đặt */
    unitPrice: number;
}

/** Cấu trúc dữ liệu phản ánh một Order hoàn chỉnh trong luồng checkout */
export interface CheckoutOrder {
    /** Mã đơn hàng tự sinh */
    id: string;
    /** Thời điểm tạo đơn ISO string */
    createdAt: string;
    /** Trạng thái vòng đời đơn hàng */
    status: "created" | "shipping" | "delivered" | "cancelled";
    /** Phương thức thanh toán lựa chọn */
    paymentMethod: "bank" | "wallet" | "cod";
    /** Thông tin địa chỉ đã chốt cho đơn này */
    shippingAddress: CheckoutAddress;
    /** Danh sách sản phẩm trong đơn */
    items: CheckoutOrderItem[];
    /** Tổng tiền cuối cùng */
    total: number;
}

// ===========================================
// Constants - Các khóa lưu trữ trong trình duyệt
// ===========================================

const ADDRESS_KEY = "checkout_addresses";
const ORDER_KEY = "checkout_orders";

/** Dữ liệu mẫu khởi tạo nếu LocalStorage trống */
const DEFAULT_ADDRESSES: CheckoutAddress[] = [
    {
        id: "addr-default-1",
        fullName: "Nguyen Van A",
        phone: "0900000001",
        line: "123 Le Loi",
        ward: "Ben Nghe",
        city: "Quan 1",
        province: "TP.HCM",
        note: "Giao gio hanh chinh",
        isDefault: true,
    },
];

// ===========================================
// Helpers
// ===========================================

/** Kiểm tra xem code có đang chạy trong trình duyệt hay không (tránh lỗi trên SSR) */
function isBrowser(): boolean {
    return typeof window !== "undefined";
}

// ===========================================
// Address Operations - Các thao tác với địa chỉ
// ===========================================

import { safeSync } from "@/shared/utils/result";

/**
 * Lấy toàn bộ danh sách địa chỉ từ bộ nhớ máy tính người dùng
 */
export function getCheckoutAddresses(): CheckoutAddress[] {
    // Nếu chạy trên Server (Node.js), trả về default ngay lập tức
    if (!isBrowser()) return DEFAULT_ADDRESSES;

    // Đọc chuỗi JSON từ LocalStorage theo key quy định
    const raw = localStorage.getItem(ADDRESS_KEY);

    // Nếu chưa từng lưu gì, trả về data mẫu
    if (!raw) return DEFAULT_ADDRESSES;

    // Go-style handling for JSON parsing
    const [parsed, error] = safeSync(() => JSON.parse(raw) as CheckoutAddress[]);

    if (error) {
        return DEFAULT_ADDRESSES;
    }

    // Đảm bảo nếu mảng rỗng thì vẫn dùng default
    return parsed?.length ? parsed : DEFAULT_ADDRESSES;
}

/**
 * Ghi đè danh sách địa chỉ vào bộ nhớ bền vững
 * @param addresses Mảng địa chỉ mới cần lưu
 */
export function saveCheckoutAddresses(addresses: CheckoutAddress[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(addresses));
}

/**
 * Thêm một địa chỉ mới và xử lý logic địa chỉ mặc định
 * @param input Dữ liệu địa chỉ từ form (không cần ID và flag mặc định)
 */
export function addCheckoutAddress(
    input: Omit<CheckoutAddress, "id" | "isDefault"> & { isDefault?: boolean }
): CheckoutAddress[] {
    // Lấy list hiện tại
    const current = getCheckoutAddresses();

    // Xác định xem địa chỉ mới có nên làm mặc định không (nếu user tích chọn hoặc list đang rỗng)
    const shouldDefault = input.isDefault ?? current.length === 0;

    // Nếu địa chỉ mới là mặc định, reset toàn bộ các địa chỉ cũ về false
    const next = current.map((a) => ({ ...a, isDefault: shouldDefault ? false : a.isDefault }));

    // Đưa địa chỉ mới vào mảng với ID duy nhất (UUID)
    next.push({
        ...input,
        id: crypto.randomUUID(),
        isDefault: shouldDefault,
    });

    // Persist xuống ổ cứng và trả về list mới cho UI render
    saveCheckoutAddresses(next);
    return next;
}

/**
 * Thay đổi địa chỉ mặc định dựa trên ID
 */
export function setDefaultCheckoutAddress(id: string): CheckoutAddress[] {
    // Duyệt mảng, chỉ set true cho ID khớp, còn lại false hết
    const next = getCheckoutAddresses().map((address) => ({
        ...address,
        isDefault: address.id === id,
    }));

    saveCheckoutAddresses(next);
    return next;
}

/**
 * Tìm địa chỉ đang được đánh dấu mặc định (để hiển thị ở bước thanh toán)
 */
export function getDefaultCheckoutAddress(): CheckoutAddress | undefined {
    return getCheckoutAddresses().find((address) => address.isDefault);
}

// ===========================================
// Order Operations - Các thao tác với lịch sử đơn hàng (Local)
// ===========================================

/**
 * Lấy lịch sử các đơn hàng đã đặt thành công (lưu tạm máy khách)
 */
export function getCheckoutOrders(): CheckoutOrder[] {
    if (!isBrowser()) return [];

    const raw = localStorage.getItem(ORDER_KEY);
    if (!raw) return [];

    const [parsed, error] = safeSync(() => JSON.parse(raw) as CheckoutOrder[]);

    if (error) {
        return [];
    }

    return parsed ?? [];
}

/**
 * Cập nhật danh sách đơn hàng vào bộ nhớ
 */
export function saveCheckoutOrders(orders: CheckoutOrder[]): void {
    if (!isBrowser()) return;
    localStorage.setItem(ORDER_KEY, JSON.stringify(orders));
}

/**
 * Lưu một đơn hàng mới vừa đặt xong
 * @param order Chi tiết đơn hàng (không cần ID và Ngày tạo - hệ thống tự sinh)
 */
export function addCheckoutOrder(
    order: Omit<CheckoutOrder, "id" | "createdAt">
): CheckoutOrder[] {
    const current = getCheckoutOrders();

    // Tạo object order hoàn chỉnh kèm metadata
    const nextOrder: CheckoutOrder = {
        ...order,
        id: `ORD-${Date.now()}`, // Sinh ID dựa trên timestamp
        createdAt: new Date().toISOString(), // Lưu thời gian hiện tại chuẩn ISO
    };

    // Đưa đơn mới nhất lên đầu danh sách (Unshift logic)
    const next = [nextOrder, ...current];

    saveCheckoutOrders(next);
    return next;
}
