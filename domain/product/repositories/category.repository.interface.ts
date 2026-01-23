import { CategoryEntity } from "../entities/category.entity";

export interface CategoryPagingResponse {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: CategoryEntity[];
    message: string;
}

export interface ICategoryRepository {
    getAll(): Promise<CategoryEntity[]>;
    getById(id: number): Promise<CategoryEntity>;
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<CategoryPagingResponse>;
}
