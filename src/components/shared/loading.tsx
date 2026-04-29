"use client";

/**
 * Các thành phần Hiển thị trạng thái đang tải (Loading Components)
 * 
 * Cung cấp các cấp độ hiển thị Loader khác nhau tùy theo quy mô của vùng dữ liệu:
 * - ScreenLoading: Phủ kín toàn bộ màn hình.
 * - FullLoading: Phủ kín vùng chứa (Container).
 * - SmallLoading: Icon xoay kích thước nhỏ (thường dùng trong Nút hoặc văn bản).
 */
import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "@/utils/cn";

/** 
 * Hiển thị Loading che kín toàn màn hình với lớp nền mờ 
 * @param message Thông điệp hiển thị kèm theo (tùy chọn)
 */
export const ScreenLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <Loader2 className="animate-spin text-white w-16 h-16" />
      {message && <p className="mt-4 text-white text-lg">{message}</p>}
    </div>
  );
};

/** 
 * Hiển thị Loading phủ kín vùng chứa hiện tại (Card, Div...)
 * @param message Thông điệp hiển thị kèm theo
 * @param className Các class CSS tùy chỉnh cho layout
 */
export const FullLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ message, className }) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center w-full h-full",
        className
      )}
    >
      <Loader2 className="animate-spin w-12 h-12 text-gray-700" />
      {message && <p className="mt-2 text-gray-700">{message}</p>}
    </div>
  );
};

/** 
 * Biểu tượng xoay kích thước nhỏ dùng cho inline element
 */
export const SmallLoading: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <Loader2
      className={cn(
        "animate-spin w-5 h-5 text-gray-500 inline-block",
        className
      )}
    />
  );
};
