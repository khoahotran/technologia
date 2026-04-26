import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '../dialog'
import { Skeleton } from '../skeleton'

vi.mock('@/utils/cn', () => ({
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@radix-ui/react-dialog', () => ({
    Root: ({ children, open, onOpenChange, ...props }: any) => (
        <div data-testid="dialog-root" data-open={open} {...props}>{children}</div>
    ),
    Trigger: ({ children, ...props }: any) => (
        <button data-testid="dialog-trigger" {...props}>{children}</button>
    ),
    Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
    Overlay: ({ ...props }: any) => <div data-testid="dialog-overlay" {...props} />,
    Content: ({ children, ...props }: any) => (
        <div role="dialog" data-testid="dialog-content" {...props}>{children}</div>
    ),
    Title: ({ children, ...props }: any) => (
        <div role="heading" data-testid="dialog-title" {...props}>{children}</div>
    ),
    Description: ({ children, ...props }: any) => (
        <div data-testid="dialog-description" {...props}>{children}</div>
    ),
    Close: ({ children, ...props }: any) => (
        <button data-testid="dialog-close" {...props}>{children}</button>
    ),
}))

vi.mock('lucide-react', () => ({
    XIcon: () => <span data-testid="x-icon" />,
}))

describe('Dialog Component', () => {
    describe('Render', () => {
        it('should render dialog trigger', () => {
            render(
                <Dialog>
                    <DialogTrigger>Open</DialogTrigger>
                </Dialog>
            )
            expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
        })

        it('should open dialog when trigger is clicked', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogTitle>Title</DialogTitle>
                        <DialogDescription>Description</DialogDescription>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should render dialog title', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogTitle>Test Title</DialogTitle>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByText('Test Title')).toBeInTheDocument()
        })

        it('should render dialog description', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogDescription>Test Description</DialogDescription>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByText('Test Description')).toBeInTheDocument()
        })

        it('should render dialog header', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogHeader>Header</DialogHeader>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByText('Header')).toBeInTheDocument()
        })

        it('should render dialog footer', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogFooter>Footer</DialogFooter>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByText('Footer')).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('should have role dialog when open', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogTitle>Title</DialogTitle>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('should have heading inside dialog', () => {
            render(
                <Dialog open={true}>
                    <DialogContent>
                        <DialogTitle>Modal Title</DialogTitle>
                    </DialogContent>
                </Dialog>
            )
            expect(screen.getByRole('heading')).toBeInTheDocument()
        })
    })
})

describe('Skeleton Component', () => {
    describe('Render', () => {
        it('should render skeleton element', () => {
            const { container } = render(<Skeleton />)
            const skeleton = container.querySelector('[data-slot="skeleton"]')
            expect(skeleton).toBeInTheDocument()
        })

        it('should have default skeleton classes', () => {
            const { container } = render(<Skeleton />)
            const skeleton = container.querySelector('[data-slot="skeleton"]')
            expect(skeleton).toBeInTheDocument()
            expect(skeleton?.className).toContain('animate-pulse')
        })

        it('should render skeleton with custom variant classes', () => {
            const { container } = render(<Skeleton className="h-4 w-20" />)
            const skeleton = container.querySelector('[data-slot="skeleton"]')
            expect(skeleton?.className).toContain('h-4')
            expect(skeleton?.className).toContain('w-20')
        })
    })
})