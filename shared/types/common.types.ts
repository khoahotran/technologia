/**
 * Common utility types used across the application
 */

// Make all properties optional recursively
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract keys that have values of a specific type
export type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

// Nullable type helper
export type Nullable<T> = T | null;

// Optional type helper
export type Optional<T> = T | undefined;

// ID types for entities
export type EntityId = string | number;

// Status types
export type Status = 'AVAILABLE' | 'UNAVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

// Sort direction
export type SortDirection = 'ASC' | 'DESC';

// Callback function types
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type ValueCallback<T> = (value: T) => void;
export type AsyncValueCallback<T> = (value: T) => Promise<void>;

// Form state type
export interface FormState<T> {
    data: T;
    errors: Partial<Record<keyof T, string>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Loading state type
export interface LoadingState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}
