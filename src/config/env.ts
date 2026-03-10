export const env = {
  apiGatewayUrl: (
    process.env["NEXT_PUBLIC_API_GATEWAY_URL"] || "http://localhost:8080"
  ).replace(/\/$/, ""),
  siteUrl: process.env["NEXT_PUBLIC_SITE_URL"] || "http://localhost:3000",
} as const;
