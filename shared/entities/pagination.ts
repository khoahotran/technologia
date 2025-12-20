import z from "zod";

export const paginationSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
	z.object({
		data: z.array(itemSchema),
		pagination: z.object({
			currentPage: z.number().int().min(1),
			totalItems: z.number().int().min(0),
			hasNextPage: z.boolean(),
			hasPreviousPage: z.boolean(),
			limit: z.number().int().min(1),
		}),
	});

export type Pagination<T extends z.ZodTypeAny> = z.infer<ReturnType<typeof paginationSchema<T>>>;

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
