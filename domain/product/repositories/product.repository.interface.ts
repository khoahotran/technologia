import { FilterResponseEntity } from "../entities/filter.entity";
import { ProductEntity } from "../entities/product.entity";

export interface ProductPagingResponse {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: ProductEntity[];
    message: string;
}

export interface FilterProductResponse {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: FilterResponseEntity[]; // "data: List<FilterResponse>"
    message: string;
}

export interface ProductSearchParams {
    page?: number | undefined;
    size?: number | undefined;
    sortBy?: string | undefined;
    sortDirection?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    keyword?: string | undefined;
    minRating?: number | undefined;
    maxRating?: number | undefined;
    categoryId?: number | undefined;
    brandId?: number | undefined;
}

export interface IProductRepository {
    getAll(): Promise<ProductEntity[]>;
    getById(id: number | string): Promise<ProductEntity>; // ID can be number or string in ProductResponse
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<ProductPagingResponse>;
    searchAndFilter(params: ProductSearchParams): Promise<FilterProductResponse>;
}
