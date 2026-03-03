/**
 * Application Layer — Use-Cases Index
 *
 * All use-cases are exported here for consumption by
 * the presentation layer (hooks, components, page handlers).
 */

// Product Use-Cases
export * from "./product";

// Brand & Category Use-Cases
export * from "./brand";
export * from "./category";

// Auth Use-Cases
export * from "./auth/login.use-case";
export * from "./auth/logout.use-case";

// Cart Use-Cases
export * from "./cart/add-to-cart.use-case";

// Checkout Use-Case (previously lib/checkout-flow)
export * from "./checkout/checkout-flow.use-case";