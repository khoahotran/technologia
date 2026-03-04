"use client";

/**
 * Provider Cấu hình TanStack Query (React Query)
 *
 * Cung cấp `QueryClient` cho toàn bộ ứng dụng để sử dụng các hooks như useQuery, useMutation.
 * Khởi tạo mặc định các tùy chọn bộ nhớ đệm chung (Cache / Stale time).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState được dùng để đảm bảo QueryClient chỉ được tạo 1 lần 
  // duy nhất lúc component mount, tránh rò rỉ bộ nhớ (memory leaks) khi re-render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Dữ liệu được coi là "tươi" (fresh) trong 5 phút. 
            // Nếu gọi lại API trong 5 phút này, nó sẽ trả ngay dữ liệu từ cache mà ko gọi network
            staleTime: 5 * 60 * 1000,

            // Thời gian lưu trữ dữ liệu rác trước khi bộ thu dọn (Garbage Collector) dọn dẹp bộ nhớ (10 phút)
            gcTime: 10 * 60 * 1000,

            // Theo hướng dẫn chuẩn, ko tự động gọi lại API khi User đổi Tab/Quay lại cửa sổ (để giảm request dư thừa)
            refetchOnWindowFocus: false,

            // Call API lại đúng 1 lần nếu nó thất bại lúc đầu
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
