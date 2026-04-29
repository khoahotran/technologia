import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

import { Button, buttonVariants } from '../button'
import { Input } from '../input'

vi.mock('@/utils/cn', () => ({
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@radix-ui/react-slot', () => ({
    Slot: ({ children }: { children: React.ReactNode }) => children,
}))

describe('Button Component', () => {
    describe('Render', () => {
        it('should render button with children', () => {
            render(<Button>Click me</Button>)
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
        })

        it('should render button with type attribute', () => {
            render(<Button type="submit">Submit</Button>)
            expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('type', 'submit')
        })

        it('should render button type attribute when specified', () => {
            render(<Button type="button">Button</Button>)
            expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
        })
    })

    describe('Variants', () => {
        it('should apply default variant classes', () => {
            const classes = buttonVariants({ variant: 'default' })
            expect(classes).toContain('bg-primary')
        })

        it('should apply destructive variant classes', () => {
            const classes = buttonVariants({ variant: 'destructive' })
            expect(classes).toContain('bg-destructive')
        })

        it('should apply outline variant classes', () => {
            const classes = buttonVariants({ variant: 'outline' })
            expect(classes).toContain('border')
        })

        it('should apply ghost variant classes', () => {
            const classes = buttonVariants({ variant: 'ghost' })
            expect(classes).toContain('hover:bg-accent')
        })

        it('should apply secondary variant classes', () => {
            const classes = buttonVariants({ variant: 'secondary' })
            expect(classes).toContain('bg-secondary')
        })

        it('should apply link variant classes', () => {
            const classes = buttonVariants({ variant: 'link' })
            expect(classes).toContain('text-primary')
        })
    })

    describe('Sizes', () => {
        it('should apply default size classes', () => {
            const classes = buttonVariants({ size: 'default' })
            expect(classes).toContain('h-9')
        })

        it('should apply sm size classes', () => {
            const classes = buttonVariants({ size: 'sm' })
            expect(classes).toContain('h-8')
        })

        it('should apply lg size classes', () => {
            const classes = buttonVariants({ size: 'lg' })
            expect(classes).toContain('h-10')
        })

        it('should apply icon size classes', () => {
            const classes = buttonVariants({ size: 'icon' })
            expect(classes).toContain('size-9')
        })
    })

    describe('Disabled State', () => {
        it('should render disabled button', () => {
            render(<Button disabled>Disabled</Button>)
            expect(screen.getByRole('button')).toHaveAttribute('disabled')
        })

        it('should disable pointer events when disabled', () => {
            const onClick = vi.fn()
            render(<Button onClick={onClick} disabled>Click</Button>)
            
            const button = screen.getByRole('button')
            fireEvent.click(button)
            
            expect(onClick).not.toHaveBeenCalled()
        })

        it('should render button with aria-disabled when disabled', () => {
            render(<Button disabled>Disabled</Button>)
            expect(screen.getByRole('button')).toBeDisabled()
        })
    })

    describe('Click Handler', () => {
        it('should call onClick when clicked', () => {
            const onClick = vi.fn()
            render(<Button onClick={onClick}>Click me</Button>)
            
            fireEvent.click(screen.getByRole('button'))
            
            expect(onClick).toHaveBeenCalledTimes(1)
        })

        it('should not call onClick when disabled', () => {
            const onClick = vi.fn()
            render(<Button onClick={onClick} disabled>Disabled</Button>)
            
            fireEvent.click(screen.getByRole('button'))
            
            expect(onClick).not.toHaveBeenCalled()
        })
    })
})

describe('Input Component', () => {
    describe('Render', () => {
        it('should render input element', () => {
            render(<Input />)
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should render input with placeholder', () => {
            render(<Input placeholder="Enter text" />)
            expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
        })

        it('should render input with type', () => {
            render(<Input type="email" />)
            expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
        })

        it('should render input with type attribute', () => {
            render(<Input type="password" />)
            const input = document.querySelector('input')
            expect(input).toHaveAttribute('type', 'password')
        })
    })

    describe('Value', () => {
        it('should render input with default value', () => {
            render(<Input defaultValue="test" />)
            expect(screen.getByRole('textbox')).toHaveValue('test')
        })

        it('should update input value on change', () => {
            render(<Input />)
            
            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'new value' } })
            
            expect(input).toHaveValue('new value')
        })
    })

    describe('Disabled State', () => {
        it('should render disabled input', () => {
            render(<Input disabled />)
            expect(screen.getByRole('textbox')).toHaveAttribute('disabled')
        })
    })

    describe('Error State', () => {
        it('should render with aria-invalid when invalid', () => {
            render(<Input aria-invalid />)
            expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
        })
    })
})