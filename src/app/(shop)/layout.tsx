/**
 * Bố cục chính cho toàn bộ khu vực Cửa hàng (Shop Layout)
 * 
 * Cấu trúc này bọc tất cả các trang hướng tới khách hàng (Home, Product, Cart, v.v.).
 * Ở đây thường chứa Header, Footer, và các ngữ cảnh (Providers) cụ thể cho shop.
 */
export default function ShopLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* <Header variant="default" /> */}
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
        </div>
    );
}
