import type { Metadata } from "next";

import { AppProviders } from "@/providers/AppProviders";
// eslint-disable-next-line no-restricted-imports
import "../../public/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL'] ?? "https://technologia.vn"),
  title: {
    default: "Technologia - Cửa hàng công nghệ hàng đầu Việt Nam",
    template: "%s | Technologia",
  },
  description: "Mua sắm smartphone, laptop, tai nghe, thiết bị gaming chính hãng với giá tốt nhất. Giao hàng nhanh, bảo hành uy tín.",
  keywords: "smartphone, laptop, tai nghe, gaming, công nghệ, điện thoại, máy tính, iPhone, Samsung, MacBook",
  authors: [{ name: "Technologia" }],
  openGraph: {
    title: "Technologia - Cửa hàng công nghệ hàng đầu",
    description: "Mua sắm sản phẩm công nghệ chính hãng với giá tốt nhất",
    url: "https://technologia.vn",
    siteName: "Technologia",
    locale: "vi_VN",
    type: "website",
  },
  alternates: {
    canonical: "https://technologia.vn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="vi">
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

