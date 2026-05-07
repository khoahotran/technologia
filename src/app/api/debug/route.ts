import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        gatewayUrl: process.env['NEXT_PUBLIC_API_GATEWAY_URL'] || (process.env as any).NEXT_PUBLIC_API_GATEWAY_URL || "NOT_SET (using default)",
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
}
