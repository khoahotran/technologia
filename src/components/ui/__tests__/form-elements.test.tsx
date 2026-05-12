 
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

import { Checkbox } from '../checkbox'
import { Switch } from '../switch'
import { Textarea } from '../textarea'

vi.mock('@/utils/cn', () => ({
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@radix-ui/react-checkbox', () => ({
    Root: ({ children, checked, onCheckedChange, disabled, ...props }: any) => (
        <button
            {...props}
            role="checkbox"
            aria-checked={checked}
            data-slot="checkbox"
            onClick={(e) => {
                onCheckedChange?.(!checked)
                props.onChange?.(e)
                props.onClick?.(e)
            }}
            disabled={disabled}
        >
            {children}
        </button>
    ),
    Indicator: ({ children }: any) => <span data-slot="checkbox-indicator">{children}</span>,
}))

vi.mock('@radix-ui/react-switch', () => ({
    Root: ({ children, checked, onCheckedChange, disabled, ...props }: any) => (
        <button
            role="switch"
            data-slot="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    ),
    Thumb: ({ children }: any) => <span data-slot="switch-thumb">{children}</span>,
}))

vi.mock('lucide-react', () => ({
    CheckIcon: () => <span data-testid="check-icon" />,
}))

describe('Form Elements Integration Tests', () => {

    describe('Textarea Component', () => {
        it('should render textarea element', () => {
            render(<Textarea />)
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        it('should render with placeholder', () => {
            render(<Textarea placeholder="Enter description" />)
            expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument()
        })

        it('should update value on change', () => {
            render(<Textarea />)
            const textarea = screen.getByRole('textbox')
            fireEvent.change(textarea, { target: { value: 'new value' } })
            expect(textarea).toHaveValue('new value')
        })

        it('should render disabled textarea', () => {
            render(<Textarea disabled />)
            expect(screen.getByRole('textbox')).toHaveAttribute('disabled')
        })

        it('should render with default value', () => {
            render(<Textarea defaultValue="default text" />)
            expect(screen.getByRole('textbox')).toHaveValue('default text')
        })

        it('should handle aria-invalid', () => {
            render(<Textarea aria-invalid />)
            expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
        })
    })

    describe('Switch Component', () => {
        it('should render switch element', () => {
            render(<Switch />)
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })

        it('should toggle switch when clicked', () => {
            const onCheckedChange = vi.fn()
            render(<Switch onCheckedChange={onCheckedChange} />)
            
            const switchEl = screen.getByRole('switch')
            fireEvent.click(switchEl)
            
            expect(onCheckedChange).toHaveBeenCalled()
        })

        it('should render checked switch', () => {
            render(<Switch checked />)
            expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
        })

        it('should render unchecked switch', () => {
            render(<Switch checked={false} />)
            expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
        })

        it('should render disabled switch', () => {
            render(<Switch disabled />)
            expect(screen.getByRole('switch')).toHaveAttribute('disabled')
        })
    })

    describe('Checkbox Component', () => {
        it('should render checkbox element', () => {
            render(<Checkbox />)
            expect(screen.getByRole('checkbox')).toBeInTheDocument()
        })

        it('should check checkbox when clicked', () => {
            const onCheckedChange = vi.fn()
            render(<Checkbox onCheckedChange={onCheckedChange} />)
            
            const checkbox = screen.getByRole('checkbox')
            fireEvent.click(checkbox)
            
            expect(onCheckedChange).toHaveBeenCalled()
        })

        it('should render checked checkbox', () => {
            render(<Checkbox checked />)
            expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
        })

        it('should render unchecked checkbox', () => {
            render(<Checkbox checked={false} />)
            expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false')
        })

        it('should render disabled checkbox', () => {
            render(<Checkbox disabled />)
            expect(screen.getByRole('checkbox')).toHaveAttribute('disabled')
        })

        it('should handle onChange callback', () => {
            const onChange = vi.fn()
            render(<Checkbox onChange={onChange} />)
            
            fireEvent.click(screen.getByRole('checkbox'))
            expect(onChange).toHaveBeenCalled()
        })
    })
})