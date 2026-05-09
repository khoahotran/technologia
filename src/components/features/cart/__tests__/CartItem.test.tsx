import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartItem } from '../CartItem';

vi.mock('@/components/features/product/QuantitySelector', () => ({
    QuantitySelector: ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
        <div data-testid="quantity-selector">
            <button onClick={() => onChange(value - 1)} data-testid="qty-decrease">-</button>
            <span data-testid="qty-value">{value}</span>
            <button onClick={() => onChange(value + 1)} data-testid="qty-increase">+</button>
        </div>
    ),
}))

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, onCheckedChange }: { checked?: boolean; onCheckedChange: (val: boolean) => void }) => (
        <input
            type="checkbox"
            data-testid="checkbox"
            checked={checked || false}
            onChange={(e) => onCheckedChange(e.target.checked)}
        />
    ),
}))

vi.mock('@/components/ui/input', () => ({
    Input: vi.fn().mockImplementation(({ placeholder }) => (
        <input type="text" placeholder={placeholder} data-testid="input" />
    )),
}))

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button onClick={onClick} {...props} data-testid="button">
            {children}
        </button>
    ),
}))

vi.mock('@/providers/language.provider', () => ({
    useLanguage: () => ({
        t: (key: string, _params?: object, fallback?: string) => fallback || key,
        locale: 'vi',
    }),
}))

describe('CartItem Component', () => {
    const mockProps = {
        id: 'prod-1',
        title: 'iPhone 15 Pro',
        price: 25000000,
        image: '/iphone15.jpg',
        productCode: 'IP15PRO',
        quantity: 2,
        isSelected: true,
        onQuantityChange: vi.fn(),
        onToggle: vi.fn(),
        onRemove: vi.fn(),
    }

    beforeEach(() => {
        vi.mocked(mockProps.onQuantityChange).mockClear()
        vi.mocked(mockProps.onToggle).mockClear()
        vi.mocked(mockProps.onRemove).mockClear()
    })

    it('should render product information correctly', () => {
        render(<CartItem {...mockProps} />)

        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
        expect(screen.getByText(/25.000.000/)).toBeInTheDocument()
        expect(screen.getByAltText('iPhone 15 Pro')).toBeInTheDocument()
    })

    it('should render product code', () => {
        render(<CartItem {...mockProps} />)
        expect(screen.getByText('IP15PRO')).toBeInTheDocument()
    })

    it('should call onQuantityChange when quantity increases', () => {
        render(<CartItem {...mockProps} />)

        const increaseBtn = screen.getByTestId('qty-increase')
        fireEvent.click(increaseBtn)

        expect(mockProps.onQuantityChange).toHaveBeenCalledWith(3)
    })

    it('should call onQuantityChange when quantity decreases', () => {
        render(<CartItem {...mockProps} />)

        const decreaseBtn = screen.getByTestId('qty-decrease')
        fireEvent.click(decreaseBtn)

        expect(mockProps.onQuantityChange).toHaveBeenCalledWith(1)
    })

    it('should call onRemove when remove button is clicked', () => {
        render(<CartItem {...mockProps} />)

        const removeBtn = screen.getByTestId('button')
        fireEvent.click(removeBtn)

        expect(mockProps.onRemove).toHaveBeenCalledTimes(1)
    })

    it('should call onToggle when checkbox is clicked', () => {
        render(<CartItem {...mockProps} />)

        const checkbox = screen.getByTestId('checkbox')
        fireEvent.click(checkbox)

        expect(mockProps.onToggle).toHaveBeenCalledWith(false)
    })

    it('should render with default product code when not provided', () => {
        render(<CartItem {...mockProps} productCode='' />)
        expect(screen.getByText('PRODUCT CODE')).toBeInTheDocument()
    })
})