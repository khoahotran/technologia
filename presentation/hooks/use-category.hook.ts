import { useQuery } from "@tanstack/react-query";
import { useCategory } from "@/application/use-cases/category/use-category";

export const useCategoryHook = () => {
    const categoryService = useCategory();

    const categoriesQuery = useQuery({
        queryKey: ["categories"],
        queryFn: categoryService.getAll,
    });

    return { categoriesQuery };
};
