import { ArrowLeft, Home, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans">
            {/* Trang trí nền */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl w-full px-6 py-12 text-center space-y-12">
                {/* 404 Visual */}
                <div className="relative inline-block">
                    <h1 className="text-[12rem] md:text-[16rem] font-black text-slate-100 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-2">
                        <ShoppingBag className="w-24 h-24 text-primary animate-bounce mb-4" />
                        <span className="text-2xl font-bold text-slate-900 bg-white px-4 py-1 shadow-lg rounded-lg border border-slate-100">
                            Page Not Found
                        </span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                        Oops! Có vẻ như bạn đã lạc vào vùng không gian khác.
                    </h2>
                    <p className="text-slate-500 text-lg max-w-md mx-auto">
                        Trang bạn đang tìm kiếm có thể đã được di chuyển, bị xóa hoặc không bao giờ tồn tại. 
                        Đừng lo, bạn có thể quay lại những nơi quen thuộc dưới đây.
                    </p>
                </div>

                {/* Helpful Links */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all hover:shadow-xl active:scale-95"
                    >
                        <Home className="w-4 h-4" />
                        Về Trang Chủ
                    </Link>
                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 transition-all hover:shadow-lg active:scale-95"
                    >
                        <Search className="w-4 h-4" />
                        Xem Sản Phẩm
                    </Link>
                </div>

                <div className="pt-12 border-t border-slate-100 max-w-xs mx-auto">
                    <Link
                        href="/"
                        className="text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm font-medium"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Quay lại trang trước đó
                    </Link>
                </div>
            </div>
        </div>
    );
}