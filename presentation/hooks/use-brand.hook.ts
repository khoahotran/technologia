import { useQuery } from "@tanstack/react-query";

import { useBrand } from "@/application/use-cases/brand/use-brand";

export const useBrandHook = () => {
    const brandService = useBrand();

    const brandsQuery = useQuery({
        queryKey: ["brands"],
        queryFn: brandService.getAll,
    });

    return { brandsQuery };
};
