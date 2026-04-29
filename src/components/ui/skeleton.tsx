/**
 * Thành phần Khung xương (Skeleton Component)
 * 
 * Dùng để hiển thị trạng thái đang tải (Loading state) dưới dạng các hình khối 
 * nhấp nháy, giúp người dùng dự đoán được bố cục dữ liệu sắp xuất hiện.
 */
import { cn } from "@/utils/cn"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { Skeleton }
