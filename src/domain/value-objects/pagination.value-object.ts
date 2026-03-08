export interface Pagination {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
}
