"use client";

import { Ghost } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/**
 * Giao diện 404 (Không Tìm Thấy Trang)
 * 
 * Hiển thị màn hình thông báo khi người dùng truy cập một đường dẫn không tồn tại.
 * Cung cấp tùy chọn quay lại trang trước đó hoặc về trang chủ.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center"
    // style={{
    // 	height:
    // 		"calc(100vh - var(--header-height) - var(--header-border-b) - var(--footer-height) - var(--footer-border-t))",
    // }}
    >
      <Ghost className="h-16 w-16 text-zinc-400" />
      <h1 className="mt-6 font-bold text-4xl text-zinc-800">404</h1>
      <p className="mt-2 text-zinc-600">Page not found</p>
      <div className="mt-6 flex gap-4">
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Button className="cursor-pointer" onClick={() => router.push("/")}>
          Home
        </Button>
      </div>
    </div>
  );
}
