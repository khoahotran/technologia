import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { QuantitySelector } from '../quantity-selector'

describe('QuantitySelector Component', () => {
    it('should render correct initial value', () => {
        render(<QuantitySelector value={5} onChange={vi.fn()} />)
        const input = screen.getByRole('spinbutton', { name: /số lượng/i }) as HTMLInputElement
        expect(input.value).toBe('5')
    })

    it('should increment when + clicked', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={5} onChange={handleChange} />)

        fireEvent.click(screen.getByLabelText('Tăng số lượng'))
        expect(handleChange).toHaveBeenCalledWith(6)
    })

    it('should decrement when - clicked', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={5} onChange={handleChange} />)

        fireEvent.click(screen.getByLabelText('Giảm số lượng'))
        expect(handleChange).toHaveBeenCalledWith(4)
    })

    it('should NOT decrement below min', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={1} min={1} onChange={handleChange} />)

        const decBtn = screen.getByLabelText('Giảm số lượng')
        expect(decBtn).toBeDisabled()

        fireEvent.click(decBtn)
        expect(handleChange).not.toHaveBeenCalled()
    })

    it('should NOT increment above max', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={10} max={10} onChange={handleChange} />)

        const incBtn = screen.getByLabelText('Tăng số lượng')
        expect(incBtn).toBeDisabled()

        fireEvent.click(incBtn)
        expect(handleChange).not.toHaveBeenCalled()
    })

    it('should handle manual input', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={5} onChange={handleChange} />)

        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '8' } })
        expect(handleChange).toHaveBeenCalledWith(8)
    })

    it('should clamp manual input', () => {
        const handleChange = vi.fn()
        render(<QuantitySelector value={5} min={1} max={10} onChange={handleChange} />)

        const input = screen.getByRole('spinbutton')
        fireEvent.change(input, { target: { value: '100' } })
        expect(handleChange).toHaveBeenCalledWith(10) // Should clamp to max
    })
})
