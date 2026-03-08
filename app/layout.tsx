import type { Metadata } from "next";

import { AppProviders } from "@/src/app/providers/AppProviders";
import "../public/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "TechStore - Cua hang dien thoai va phu kien",
  description: "Cua hang ban le dien thoai, phu kien thong minh chinh hang",
  generator: "Next.js",
  applicationName: "TechStore",
  authors: [{ name: "TechStore Team" }],
  keywords: ["Next.js", "React", "TypeScript", "E-commerce", "TechStore"],
  openGraph: {
    title: "TechStore",
    description: "Cua hang ban le dien thoai, phu kien thong minh chinh hang",
    url: "https://techstore-example.com",
    siteName: "TechStore",
    images: [
      {
        url: "https://techstore-example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TechStore Og Image",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <body className="font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
