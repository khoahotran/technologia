/**
 * Bố cục Xác thực (Auth Layout)
 * 
 * Bọc các trang liên quan đến quản lý tài khoản như Đăng nhập, Đăng ký, 
 * Quên mật khẩu. Cung cấp giao diện nền xám đồng nhất và footer đơn giản.
 */
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* <div className="p-4 md:p-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </div> */}
            <main className="flex-1 flex items-center justify-center p-4">
                {children}
            </main>
            <footer className="py-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} TechStore. All rights reserved.
            </footer>
        </div>
    );
}
