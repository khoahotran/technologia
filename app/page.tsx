import Banner from "@/components/features/Banner";
import { TopProducts } from "@/components/features/home/TopProducts";
import { HotProducts } from "@/components/features/home/HotProducts";
import { Subscribe } from "@/components/features/home/Subscribe";
import { Metadata } from "next";

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
