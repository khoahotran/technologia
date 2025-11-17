// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// Các route public
const PUBLIC_PATHS = [
  "/",
  "/products",
  "/products/",
  "/about",
  "/login",
  "/signup",
  "/api/public",
];

// Các route admin
const ADMIN_PATHS = ["/admin", "/admin/"];

// Middleware
export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Nếu route public → cho phép
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Lấy token JWT từ cookie
  const token = req.cookies.get("token")?.value;

  // Chưa login → redirect login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Parse JWT để lấy role
  let role: string | undefined;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    role = payload.role;
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin route → kiểm tra role
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // User route → chỉ cần login, đã check token
  return NextResponse.next();
}

// Matcher để middleware áp dụng cho tất cả trừ file tĩnh
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
