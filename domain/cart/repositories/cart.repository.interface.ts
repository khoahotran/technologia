import {
    CartItem,
    CartMap,
    AddToCartPayload,
    CalculatePricePayload,
} from "../entities/cart.entity";

export interface CartPagingParams {
    page?: number;
    size?: number;
    sortDir?: "ASC" | "DESC";
    sortBy?: string;
}

export interface ICartRepository {
    getCart(): Promise<CartMap>;
    getCartWithPaging(params: CartPagingParams): Promise<CartMap>;
    addToCart(payload: AddToCartPayload): Promise<any>;
    increase(cartItemId: string): Promise<any>;
    decrease(cartItemId: string): Promise<any>;
    remove(cartItemId: string): Promise<any>;
    getCartItem(cartItemId: string): Promise<CartItem>;
    calculatePrice(payload: CalculatePricePayload): Promise<number>;
}
