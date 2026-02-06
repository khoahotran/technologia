import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePagination, useDebounce, useApiQuery } from '../use-api.hook'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// Wrapper for Query hooks
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('Hooks Utilities', () => {

    describe('usePagination', () => {
        it('should initialize with defaults', () => {
            const { result } = renderHook(() => usePagination())
            expect(result.current.page).toBe(0)
            expect(result.current.size).toBe(10)
        })

        it('should update page and reset logic', () => {
            const { result } = renderHook(() => usePagination())

            act(() => result.current.setPage(2))
            expect(result.current.page).toBe(2)

            act(() => result.current.setSize(20))
            expect(result.current.size).toBe(20)
            expect(result.current.page).toBe(0) // Should reset to 0 on size change
        })

        it('should toggle sort direction', () => {
            const { result } = renderHook(() => usePagination()) // default DESC

            act(() => result.current.toggleSortDirection())
            expect(result.current.sortDirection).toBe('ASC')

            act(() => result.current.toggleSortDirection())
            expect(result.current.sortDirection).toBe('DESC')
        })
    })

    describe('useDebounce', () => {
        it('should debounce value updates', async () => {
            vi.useFakeTimers()
            const { result, rerender } = renderHook(
                ({ val }: { val: string }) => useDebounce(val, 500),
                { initialProps: { val: 'initial' } }
            )

            expect(result.current).toBe('initial')

            // Update value
            rerender({ val: 'updated' })
            expect(result.current).toBe('initial') // Should not update yet

            // Fast forward time
            act(() => {
                vi.advanceTimersByTime(500)
            })

            expect(result.current).toBe('updated')
            vi.useRealTimers()
        })
    })

    describe('useApiQuery', () => {
        it('should fetch data successfully', async () => {
            const mockFn = vi.fn().mockResolvedValue('success data')
            const { result } = renderHook(
                () => useApiQuery(['test'], mockFn),
                { wrapper: createWrapper() }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toBe('success data')
        })

        it('should handle errors and callbacks', async () => {
            const mockFn = vi.fn().mockRejectedValue(new Error('fail'))
            const onError = vi.fn()

            const { result } = renderHook(
                () => useApiQuery(['test-error'], mockFn, { onError, retry: false }),
                { wrapper: createWrapper() }
            )

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(onError).toHaveBeenCalledWith(expect.any(Error))
        })
    })
})
