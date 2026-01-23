import { BrandEntity } from "../entities/brand.entity";

export interface BrandPagingResponse {
    status: number;
    page_number: number;
    page_size: number;
    count_items: number;
    count_pages: number;
    data: BrandEntity[];
    message: string;
}

export interface IBrandRepository {
    getAll(): Promise<BrandEntity[]>;
    getById(id: number): Promise<BrandEntity>;
    getPaged(page?: number, size?: number, sortBy?: string, sortDirection?: string): Promise<BrandPagingResponse>;
}
