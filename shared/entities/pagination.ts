import z from "zod";

/**
 * Tạo schema phân trang dùng chung (Generic Pagination Schema)
 * Cung cấp giải pháp chuẩn hóa cho dữ liệu list trả về từ API dạng phân trang.
 *
 * @param itemSchema Generic type đại diện cho Zod Schema của phần tử bên trong danh sách
 */
export const paginationSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		// Danh sách các phần tử (items)
		data: z.array(itemSchema),
		// Khối thông tin phân trang (metadata)
		pagination: z.object({
			currentPage: z.number().int().min(1),
			totalItems: z.number().int().min(0),
			hasNextPage: z.boolean(),
			hasPreviousPage: z.boolean(),
			limit: z.number().int().min(1),
		}),
	});

// Kiểu dữ liệu Typescript được suy diễn tự động từ Schema
export type Pagination<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof paginationSchema<T>>>;

/**
 * Hàm khởi tạo dữ liệu đối tượng rỗng theo chuẩn Pagination Schema.
 * Hữu dụng cho các fallback / initial state của UI khi đang chờ fetch.
 */
export const paginationDefault = <T extends z.ZodTypeAny>(_itemSchema: T): Pagination<T> => ({
	data: [],
	pagination: {
		currentPage: 1,
		totalItems: 0,
		hasNextPage: false,
		hasPreviousPage: false,
		limit: 10,
	},
});
