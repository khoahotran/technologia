/**
 * Tiện ích Ủy thác (Proxy Utility)
 * 
 * Cung cấp một hàm tạo Proxy đơn giản để chuyển tiếp request từ Next.js Client 
 * sang bất kỳ một URL Backend đích nào khác.
 */
import { NextResponse } from "next/server";

/**
 * Tạo một request chuyển tiếp (Proxy)
 * @param req Đối tượng Request gốc nhận được từ Next.js API Route
 * @param targetUrl URL gốc của Backend đích (không kèm query params)
 * @returns Phản hồi NextResponse để trả về cho Client
 */
export async function createProxy(
    req: Request,
    targetUrl: string
) {
    try {
        const { search } = new URL(req.url);
        // Gắn thêm các tham số truy vấn (query params) từ request gốc vào URL đích
        const finalUrl = targetUrl + search;

        console.warn(`[Proxy] Chuyển tiếp ${req.method} ${req.url} -> ${finalUrl}`);

        const res = await fetch(finalUrl, {
            method: req.method,
            headers: {
                "Content-Type": "application/json",
                // Chuyển tiếp Header Authorization nếu Client có gửi lên
                ...(req.headers.get("Authorization") ? { "Authorization": req.headers.get("Authorization")! } : {}),
            },
            // Chỉ trích xuất Body cho các phương thức ghi dữ liệu
            body: ["GET", "HEAD"].includes(req.method) ? null : await req.arrayBuffer(),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return NextResponse.json(
                { error: data.message || `Lỗi từ Proxy: ${res.statusText}` },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Proxy] Lỗi Hệ thống:", error);
        return NextResponse.json({ error: "Lỗi máy chủ nội bộ (Proxy Internal Error)" }, { status: 500 });
    }
}
