/**
 * Application Routes Constant
 */
export const appRoutes = {
    home: "/",
    login: "/login",
    register: "/register",
    products: "/products",
    productDetail: (id: string | number) => `/products/${id}`,
    cart: "/cart",
    shipping: "/shipping",
    orders: "/orders",
    orderDetail: (id: string | number) => `/orders/${id}`,
    orderTracking: (id: string | number) => `/orders/${id}/tracking`,
    orderFeedback: (id: string | number) => `/orders/${id}/feedback`,
    profile: "/profile",
    addressBook: "/address-book",
};
