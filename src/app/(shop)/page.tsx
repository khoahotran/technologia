import type { Metadata } from "next";

import Banner from "@/components/features/Banner";
import { HotProducts } from "@/components/features/home/HotProducts";
import { Subscribe } from "@/components/features/home/Subscribe";
import { TopProducts } from "@/components/features/home/TopProducts";

/**
 * Cấu hình siêu dữ liệu (Metadata) cho trang chủ nhằm hỗ trợ SEO tốt nhất.
 * Cung cấp tiêu đề, mô tả và các thẻ Open Graph cho mạng xã hội.
 */
export const metadata: Metadata = {
  title: "Technologia - Cửa hàng công nghệ hàng đầu Việt Nam",
  description: "Mua sắm smartphone, laptop, tai nghe, thiết bị gaming chính hãng với giá tốt nhất. Giao hàng nhanh, bảo hành uy tín tại Technologia.",
  keywords: "smartphone, laptop, tai nghe, gaming, công nghệ, điện thoại, máy tính, iPhone, Samsung, MacBook, Dell",
  openGraph: {
    title: "Technologia - Cửa hàng công nghệ hàng đầu",
    description: "Mua sắm sản phẩm công nghệ chính hãng với giá tốt nhất",
    type: "website",
    locale: "vi_VN",
  },
};

/**
 * Trang Chủ (Home Page)
 * 
 * Điểm vào (Entry point) chính của ứng dụng dành cho khách hàng.
 * Lắp ráp các khối tính năng bao gồm: Banner quảng cáo, Sản phẩm hàng đầu, 
 * Sản phẩm nổi bật và Form đăng ký nhận bản tin.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Banner />
      <TopProducts />
      <HotProducts />
      <Subscribe />
    </div>
  );
}
