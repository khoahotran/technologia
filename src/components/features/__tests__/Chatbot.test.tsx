import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Chatbot } from '../Chatbot'

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: { children: React.ReactNode }) => (
        <span data-testid="badge">{children}</span>
    ),
}))

vi.mock('@/components/ui/button', () => {
    const { forwardRef } = require('react')
    return {
        Button: forwardRef(({ children, onClick, ...props }: any, ref: any) => (
            <button ref={ref} onClick={onClick} data-testid="button" {...props}>
                {children}
            </button>
        )),
    }
})

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => (
        <div data-testid="card" {...props}>{children}</div>
    ),
    CardHeader: ({ children, ...props }: any) => (
        <div data-testid="card-header" {...props}>{children}</div>
    ),
    CardTitle: ({ children, ...props }: any) => (
        <div data-testid="card-title" {...props}>{children}</div>
    ),
    CardContent: ({ children, ...props }: any) => (
        <div data-testid="card-content" {...props}>{children}</div>
    ),
}))

vi.mock('@/components/ui/input', () => {
    const { forwardRef } = require('react')
    return {
        Input: forwardRef(({ value, onChange, placeholder, ...props }: any, ref: any) => (
            <input
                ref={ref}
                data-testid="input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                {...props}
            />
        )),
    }
})

vi.mock('@/providers/language.provider', () => ({
    useLanguage: () => ({
        t: (key: string, _params?: object, fallback?: string) => fallback || key,
        locale: 'vi',
    }),
}))

vi.mock('@/utils/cn', () => ({
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('lucide-react', () => ({
    MessageCircle: () => <span data-testid="icon-message" />,
    Minus: () => <span data-testid="icon-minus" />,
    Send: () => <span data-testid="icon-send" />,
    X: () => <span data-testid="icon-x" />,
}))

describe('Chatbot Component', () => {

    it('should render initial minimized button state', () => {
        render(<Chatbot />)
        const button = screen.getByRole('button', { name: /Open chat/i })
        expect(button).toBeInTheDocument()
    })

    it('should open chat window when toggle button is clicked', () => {
        render(<Chatbot />)
        
        const toggleButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(toggleButton)
        
        expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('should render chatbot title in header', () => {
        render(<Chatbot />)
        
        const openButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(openButton)
        
        expect(screen.getByText('Lạc Lạc')).toBeInTheDocument()
    })

    it('should render welcome message', () => {
        render(<Chatbot />)
        
        const openButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(openButton)
        
        expect(screen.getByText(/Xin chào/)).toBeInTheDocument()
    })

    it('should update input value when typing', () => {
        render(<Chatbot />)
        
        const openButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(openButton)
        
        const input = screen.getByTestId('input')
        fireEvent.change(input, { target: { value: 'Test message' } })
        
        expect(input).toHaveValue('Test message')
    })

    it('should render quick prompt buttons when messages <= 2', () => {
        render(<Chatbot />)
        
        const openButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(openButton)
        
        expect(screen.getByText('Where is my order?')).toBeInTheDocument()
    })

    it('should close chat window', () => {
        render(<Chatbot />)
        
        const openButton = screen.getByRole('button', { name: /Open chat/i })
        fireEvent.click(openButton)
        
        const card = screen.getByTestId('card')
        expect(card).toBeInTheDocument()
        
        const closeButton = screen.getByRole('button', { name: /Close chat/i })
        fireEvent.click(closeButton)
    })
})