import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { Suspense } from "react";

import Loading from "./loading";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/shared/providers/auth.provider";
import { LanguageProvider } from "@/shared/providers/language.provider";
import { QueryProvider } from "@/shared/providers/query.provider";
import { RepositoryProvider } from "@/shared/providers/repository.provider";
import "../public/globals.css";


/**
 * Cấu hình siêu dữ liệu (metadata) mặc định cho ứng dụng, bao gồm SEO tags, 
 * thông tin OpenGraph để chia sẻ trên mạng xã hội.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env['NEXT_PUBLIC_SITE_URL']!),
  title: "TechStore - Cửa hàng điện thoại và phụ kiện",
  description: "Cửa hàng bán lẻ điện thoại, phụ kiện thông minh chính hãng",
  generator: "Next.js",
  applicationName: "TechStore",
  authors: [{ name: "TechStore Team" }],
  keywords: ["Next.js", "React", "TypeScript", "E-commerce", "TechStore"],
  openGraph: {
    title: "TechStore",
    description: "Cửa hàng bán lẻ điện thoại, phụ kiện thông minh chính hãng",
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

/**
 * Bố cục gốc (Root Layout) của ứng dụng
 * 
 * Bọc toàn bộ ứng dụng bằng các context providers cần thiết:
 * - LanguageProvider: Đa ngôn ngữ (i18n).
 * - QueryProvider: Quản lý cache và state API (React Query).
 * - Toaster: Hiển thị thông báo (Sonner).
 * - RepositoryProvider: Cung cấp các DI (Dependency Injection) repositories.
 * - GoogleOAuthProvider: Đăng nhập bằng Google.
 * - AuthProvider: Quản lý trạng thái đăng nhập.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning={true} lang="en">
      <body className={`font-sans`}>
        <LanguageProvider>
          <Suspense fallback={<Loading />}>
            <QueryProvider>
              <Toaster
                richColors
                position="top-center"
                toastOptions={{
                  className: "mx-auto",
                }}
              />
              <RepositoryProvider>
                {process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] ? (
                  <GoogleOAuthProvider clientId={process.env["NEXT_PUBLIC_GOOGLE_CLIENT_ID"]}>
                    <AuthProvider>
                      {children}
                    </AuthProvider>
                  </GoogleOAuthProvider>
                ) : (
                  <AuthProvider>
                    {children}
                  </AuthProvider>
                )}
              </RepositoryProvider>

            </QueryProvider>
          </Suspense>
          {/* </ThemeProvider> */}
        </LanguageProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
