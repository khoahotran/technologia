import type { CreateProductDto, UpdateProductDto } from "../dto";
import type { ProductEntity } from "../entities/product.entity";

export interface IProductRepository {
    getAll(): Promise<ProductEntity[]>;
    getById(id: string): Promise<ProductEntity>;
    create(dto: CreateProductDto): Promise<ProductEntity>;
    update(id: string, dto: UpdateProductDto): Promise<ProductEntity>;
    delete(id: string): Promise<void>;
    getPaged(
        page?: number,
        size?: number,
        sortBy?: string,
        sortDirection?: string,
        name?: string,
        minPrice?: number,
        maxPrice?: number,
        minStar?: number,
        maxStar?: number
    ): Promise<{ data: ProductEntity[], total: number }>;
}
