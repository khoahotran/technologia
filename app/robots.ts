
import { NextResponse } from "next/server";

export function GET() {
    const content = `
        User-agent: *
        Disallow: /admin/
        Sitemap: https://www.myelectronicsstore.com/sitemap.xml
        `;
    return new NextResponse(content, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}
