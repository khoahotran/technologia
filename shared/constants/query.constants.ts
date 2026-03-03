/**
 * TanStack Query Configuration Constants
 * Defines caching strategies for different data types
 */

export const QUERY_CONFIG = {
    /** Dynamic data that changes frequently (Cart, User Status) */
    DYNAMIC: {
        staleTime: 0,
        gcTime: 5 * 60 * 1000, // 5 minutes
    },

    /** Standard data (Products, Orders) */
    STANDARD: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
    },

    /** Static data that rarely changes (Brands, Categories, Config) */
    STATIC: {
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        gcTime: 48 * 60 * 60 * 1000, // 48 hours
    },

    /** Short term caching for UI states */
    UI: {
        staleTime: 10 * 1000, // 10 seconds
        gcTime: 60 * 1000, // 1 minute
    }
} as const;
