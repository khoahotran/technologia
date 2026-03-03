"use client";

/**
 * useDebounce Hook
 *
 * Delays a value update by `delay` ms.
 * Moved from presentation/hooks/use-api.hook.ts to shared/hooks/
 * so it can be consumed from any layer (e.g. feature components, admin hooks).
 *
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
 */

import * as React from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
