"use client";

import { FullLoading } from "@/components/shared/loading";

/**
 * Giao diện Tải trang (Loading Overlay)
 * 
 * Sử dụng FullLoading để hiển thị vòng xoay thân thiện mà không che khuất toàn bộ màn hình
 * bằng lớp overlay màu đen khó chịu.
 */
export default function Loading({ message }: { message?: string }) {
  return <FullLoading message={message || ''} className="min-h-[50vh]" />;
}
