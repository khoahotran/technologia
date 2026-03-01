import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { COOKIE_NAMES } from "@/shared/constants";

export default function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const token = req.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;

  const protectedRoutes = ["/cart", "/checkout", "/profile"];
  if (!token && protectedRoutes.includes(url)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (url.startsWith("/admin")) {
    const role = req.cookies.get("role")?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}
