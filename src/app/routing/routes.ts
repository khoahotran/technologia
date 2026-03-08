export const appRoutes = {
  home: "/",
  login: "/login",
  register: "/register",
  cart: "/cart",
  shipping: "/shipping",
  products: "/products",
  productDetail: (id: string | number) => `/products/${id}`,
} as const;
