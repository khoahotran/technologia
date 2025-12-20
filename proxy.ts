import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const token = req.cookies.get("token")?.value;

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
