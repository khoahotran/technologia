// Mock data for the entire application
// Centralized data source for consistency

export interface Product {
    id: string
    name: string
    price: number
    originalPrice?: number
    image: string
    badge?: string
    rating: number
    reviewCount: number
    category: string
    brand: string
    description: string
    specifications: Record<string, string>
    inStock: boolean
    sku: string
}

export interface Category {
    id: string
    name: string
    slug: string
    productCount: number
}

export interface Review {
    id: string
    productId: string
    userName: string
    rating: number
    comment: string
    date: string
    verified: boolean
}

export interface Address {
    id: string
    name: string
    phone: string
    address: string
    city: string
    province: string
    ward: string
    street: string
    no: string
    note?: string
    isDefault: boolean
}

export interface Order {
    id: string
    orderNumber: string
    items: OrderItem[]
    total: number
    subtotal: number
    shipping: number
    status: 'created' | 'paid' | 'shipping' | 'delivered' | 'cancelled'
    createdAt: string
    updatedAt: string
    shippingAddress: Address
    paymentMethod: 'bank' | 'ewallet' | 'cod'
    timeline: OrderTimeline[]
}

export interface OrderItem {
    productId: string
    productName: string
    quantity: number
    price: number
    image: string
}

export interface OrderTimeline {
    status: string
    date: string
    completed: boolean
    description?: string
}

// Categories
export const categories: Category[] = [
    { id: '1', name: 'Smartphone', slug: 'smartphone', productCount: 150 },
    { id: '2', name: 'Laptop', slug: 'laptop', productCount: 89 },
    { id: '3', name: 'Gaming Equipment', slug: 'gaming', productCount: 67 },
    { id: '4', name: 'Headphone', slug: 'headphone', productCount: 45 },
    { id: '5', name: 'Speaker', slug: 'speaker', productCount: 32 },
    { id: '6', name: 'Tablet', slug: 'tablet', productCount: 28 },
]

// Products
export const products: Product[] = [
    {
        id: '1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 29990000,
        originalPrice: 34990000,
        image: '/images/products/iphone-15-pro.jpg',
        badge: 'NEW',
        rating: 4.8,
        reviewCount: 234,
        category: 'Smartphone',
        brand: 'Apple',
        description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP chất lượng cao, và thiết kế titan cao cấp.',
        specifications: {
            'Màn hình': '6.7" Super Retina XDR',
            'Chip': 'Apple A17 Pro',
            'RAM': '8GB',
            'Bộ nhớ': '256GB',
            'Camera sau': '48MP + 12MP + 12MP',
            'Camera trước': '12MP',
            'Pin': '4422 mAh',
        },
        inStock: true,
        sku: 'IP15PM256',
    },
    {
        id: '2',
        name: 'Samsung Galaxy S24 Ultra 512GB',
        price: 31990000,
        originalPrice: 36990000,
        image: '/images/products/samsung-s24.jpg',
        badge: 'HOT',
        rating: 4.7,
        reviewCount: 189,
        category: 'Smartphone',
        brand: 'Samsung',
        description: 'Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP, và hiệu năng vượt trội cùng Snapdragon 8 Gen 3.',
        specifications: {
            'Màn hình': '6.8" Dynamic AMOLED 2X',
            'Chip': 'Snapdragon 8 Gen 3',
            'RAM': '12GB',
            'Bộ nhớ': '512GB',
            'Camera sau': '200MP + 50MP + 12MP + 10MP',
            'Camera trước': '12MP',
            'Pin': '5000 mAh',
        },
        inStock: true,
        sku: 'SGS24U512',
    },
    {
        id: '3',
        name: 'MacBook Pro 14" M3 Pro 18GB 512GB',
        price: 54990000,
        originalPrice: 59990000,
        image: '/images/products/macbook-pro-14.jpg',
        badge: 'SALE',
        rating: 4.9,
        reviewCount: 156,
        category: 'Laptop',
        brand: 'Apple',
        description: 'MacBook Pro 14" với chip M3 Pro mạnh mẽ, màn hình Liquid Retina XDR tuyệt đẹp, hoàn hảo cho công việc chuyên nghiệp.',
        specifications: {
            'Màn hình': '14.2" Liquid Retina XDR',
            'Chip': 'Apple M3 Pro',
            'RAM': '18GB',
            'SSD': '512GB',
            'GPU': '14-core',
            'Trọng lượng': '1.55 kg',
            'Pin': 'Lên đến 18 giờ',
        },
        inStock: true,
        sku: 'MBP14M3P18',
    },
    {
        id: '4',
        name: 'Dell XPS 15 9530 i9-13900H RTX 4070',
        price: 48990000,
        image: '/images/products/dell-xps-15.jpg',
        rating: 4.6,
        reviewCount: 98,
        category: 'Laptop',
        brand: 'Dell',
        description: 'Dell XPS 15 cao cấp với Intel Core i9 thế hệ 13, RTX 4070, màn hình 3.5K OLED đẹp mắt.',
        specifications: {
            'Màn hình': '15.6" 3.5K OLED',
            'CPU': 'Intel Core i9-13900H',
            'RAM': '32GB DDR5',
            'SSD': '1TB',
            'GPU': 'NVIDIA RTX 4070 8GB',
            'Trọng lượng': '1.86 kg',
            'Pin': '86 Wh',
        },
        inStock: true,
        sku: 'XPS159530',
    },
    {
        id: '5',
        name: 'Sony WH-1000XM5 Wireless Headphones',
        price: 8990000,
        originalPrice: 9990000,
        image: '/images/products/sony-wh1000xm5.jpg',
        badge: 'BEST SELLER',
        rating: 4.8,
        reviewCount: 412,
        category: 'Headphone',
        brand: 'Sony',
        description: 'Tai nghe chống ồn hàng đầu với công nghệ AI, chất lượng âm thanh Hi-Res, pin 30 giờ.',
        specifications: {
            'Kết nối': 'Bluetooth 5.2',
            'Chống ồn': 'ANC thế hệ mới',
            'Pin': 'Lên đến 30 giờ',
            'Microphone': '8 mic chống ồn',
            'Trọng lượng': '250g',
        },
        inStock: true,
        sku: 'WH1000XM5',
    },
    {
        id: '6',
        name: 'Logitech G Pro X Superlight 2',
        price: 3590000,
        image: '/images/products/logitech-gpro.jpg',
        rating: 4.7,
        reviewCount: 267,
        category: 'Gaming Equipment',
        brand: 'Logitech',
        description: 'Chuột gaming wireless nhẹ nhất thế giới, sensor HERO 2, hoàn hảo cho game thủ chuyên nghiệp.',
        specifications: {
            'Cảm biến': 'HERO 2',
            'DPI': 'Lên đến 32,000',
            'Trọng lượng': '60g',
            'Pin': 'Lên đến 95 giờ',
            'Kết nối': 'LIGHTSPEED Wireless',
        },
        inStock: true,
        sku: 'GPROSL2',
    },
]

// Reviews
export const reviews: Review[] = [
    {
        id: '1',
        productId: '1',
        userName: 'Nguyễn Minh Anh',
        rating: 5,
        comment: 'Sản phẩm rất tốt, camera chụp hình đẹp, pin trâu. Giao hàng nhanh, đóng gói cẩn thận.',
        date: '2025-01-15',
        verified: true,
    },
    {
        id: '2',
        productId: '1',
        userName: 'Trần Văn Bình',
        rating: 4,
        comment: 'iPhone chất lượng như mong đợi. Giá hơi cao nhưng xứng đáng.',
        date: '2025-01-10',
        verified: true,
    },
    {
        id: '3',
        productId: '2',
        userName: 'Lê Thị Cúc',
        rating: 5,
        comment: 'Galaxy S24 Ultra quá đỉnh! Bút S Pen rất tiện, màn hình đẹp, camera zoom xa xịn sò.',
        date: '2025-01-12',
        verified: true,
    },
]

// Addresses
export const addresses: Address[] = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        phone: '0901234567',
        address: 'Số 123, Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
        city: 'TP.HCM',
        province: 'TP.HCM',
        ward: 'Phường Bến Nghé',
        street: 'Lê Lợi',
        no: '123',
        note: 'Giao giờ hành chính',
        isDefault: true,
    },
    {
        id: '2',
        name: 'Nguyễn Văn An',
        phone: '0901234567',
        address: 'Số 456, Đường Nguyễn Huệ, Phường Bến Thành, Quận 1, TP.HCM',
        city: 'TP.HCM',
        province: 'TP.HCM',
        ward: 'Phường Bến Thành',
        street: 'Nguyễn Huệ',
        no: '456',
        isDefault: false,
    },
]

// Orders
export const orders: Order[] = [
    {
        id: '1',
        orderNumber: '#ORD20250115001',
        items: [
            {
                productId: '1',
                productName: 'iPhone 15 Pro Max 256GB',
                quantity: 1,
                price: 29990000,
                image: '/images/products/iphone-15-pro.jpg',
            },
        ],
        total: 29990000,
        subtotal: 29990000,
        shipping: 0,
        status: 'delivered',
        createdAt: '2025-01-15T09:00:00',
        updatedAt: '2025-01-18T14:24:00',
        shippingAddress: addresses[0]!,
        paymentMethod: 'bank',
        timeline: [
            {
                status: 'Order created',
                date: 'Wed, 15 Jan 2025, 9:00 AM',
                completed: true,
                description: 'Đơn hàng của bạn đã được tạo và đang chờ xác nhận.',
            },
            {
                status: 'Payment success',
                date: 'Wed, 15 Jan 2025, 9:19 AM',
                completed: true,
                description: 'Đơn hàng đã được thanh toán thành công qua chuyển khoản ngân hàng.',
            },
            {
                status: 'On shipping',
                date: 'Thu, 16 Jan 2025, 1:00 PM',
                completed: true,
                description: 'Đơn hàng đã được giao cho đơn vị vận chuyển. Mã vận đơn: VN123456789.',
            },
            {
                status: 'Order delivered',
                date: 'Sat, 18 Jan 2025, 2:24 PM',
                completed: true,
                description: 'Đơn hàng đã được giao thành công.',
            },
        ],
    },
    {
        id: '2',
        orderNumber: '#ORD20250120002',
        items: [
            {
                productId: '3',
                productName: 'MacBook Pro 14" M3 Pro 18GB 512GB',
                quantity: 1,
                price: 54990000,
                image: '/images/products/macbook-pro-14.jpg',
            },
            {
                productId: '5',
                productName: 'Sony WH-1000XM5 Wireless Headphones',
                quantity: 1,
                price: 8990000,
                image: '/images/products/sony-wh1000xm5.jpg',
            },
        ],
        total: 63980000,
        subtotal: 63980000,
        shipping: 0,
        status: 'shipping',
        createdAt: '2025-01-20T10:30:00',
        updatedAt: '2025-01-21T08:15:00',
        shippingAddress: addresses[0]!,
        paymentMethod: 'ewallet',
        timeline: [
            {
                status: 'Order created',
                date: 'Mon, 20 Jan 2025, 10:30 AM',
                completed: true,
            },
            {
                status: 'Payment success',
                date: 'Mon, 20 Jan 2025, 10:45 AM',
                completed: true,
            },
            {
                status: 'On shipping',
                date: 'Tue, 21 Jan 2025, 8:15 AM',
                completed: true,
            },
            {
                status: 'Order delivered',
                date: '',
                completed: false,
            },
        ],
    },
]

// Helper functions
export function getProductById(id: string): Product | undefined {
    return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
    return products.filter((p) => p.category === category)
}

export function getReviewsByProductId(productId: string): Review[] {
    return reviews.filter((r) => r.productId === productId)
}

export function getOrderById(id: string): Order | undefined {
    return orders.find((o) => o.id === id)
}

export function getOrdersByStatus(status: Order['status']): Order[] {
    return orders.filter((o) => o.status === status)
}
