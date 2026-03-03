import process from "node:process";

/** @type {import('next').NextConfig} */

// Service URLs (can be overridden via environment variables)
const USER_SERVICE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:8081";
const PRODUCT_SERVICE_URL = process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || "http://localhost:8082";
const CART_SERVICE_URL = process.env.NEXT_PUBLIC_CART_SERVICE_URL || "http://localhost:8083";

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "rukminim2.flixcart.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  /**
   * API Proxy Rewrites
   * Routes Next.js API calls (/api/...) to the correct microservice.
   * httpClient baseURL is localhost:3000/api, so these rewrites bridge the gap.
   *
   * User Service (8081): auth, users
   * Product Service (8082): products, brands, categories
   * Cart Service (8083): carts, cart-items
   */
  async rewrites() {
    return [
      // User Service - Authentication
      {
        source: "/api/auth/:path*",
        destination: `${USER_SERVICE_URL}/api/auth/:path*`,
      },
      // User Service - User Profile
      {
        source: "/api/users/:path*",
        destination: `${USER_SERVICE_URL}/api/users/:path*`,
      },
      // Product Service - Products
      {
        source: "/api/products/:path*",
        destination: `${PRODUCT_SERVICE_URL}/api/products/:path*`,
      },
      // Product Service - Brands
      {
        source: "/api/brands/:path*",
        destination: `${PRODUCT_SERVICE_URL}/api/brands/:path*`,
      },
      // Product Service - Categories
      {
        source: "/api/categories/:path*",
        destination: `${PRODUCT_SERVICE_URL}/api/categories/:path*`,
      },
      // Cart Service - Carts
      {
        source: "/api/carts/:path*",
        destination: `${CART_SERVICE_URL}/api/carts/:path*`,
      },
      // Cart Service - Cart Items (increase/decrease/delete)
      {
        source: "/api/cart-items/:path*",
        destination: `${CART_SERVICE_URL}/api/cart-items/:path*`,
      },
    ];
  },
};

export default nextConfig;
