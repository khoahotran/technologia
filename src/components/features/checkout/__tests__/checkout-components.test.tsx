import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { vi, describe, it, expect } from 'vitest'

import { AddressForm } from '../AddressForm'
import { PaymentMethodList } from '../PaymentMethodList'

vi.mock('@/components/ui/button', () => {
    const { forwardRef } = require('react')
    return {
        Button: forwardRef(({ children, onClick, type, disabled, ...props }: any, ref: any) => (
            <button ref={ref} onClick={onClick} type={type} disabled={disabled} data-testid="button" {...props}>
                {children}
            </button>
        )),
    }
})

vi.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ checked, id }: { checked?: boolean; id?: string }) => (
        <input type="checkbox" data-testid="checkbox" id={id} defaultChecked={checked || false} />
    ),
}))

vi.mock('@/components/ui/input', () => {
    const { forwardRef } = require('react')
    return {
        Input: forwardRef((props: any, ref: any) => (
            <input ref={ref} data-testid="input" {...props} />
        )),
    }
})

vi.mock('@/components/ui/textarea', () => {
    const { forwardRef } = require('react')
    return {
        Textarea: forwardRef((props: any, ref: any) => (
            <textarea ref={ref} data-testid="textarea" {...props} />
        )),
    }
})

vi.mock('@/providers/language.provider', () => ({
    useLanguage: () => ({
        t: (key: string, _params?: object, fallback?: string) => fallback || key,
        locale: 'vi',
    }),
}))

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderWithQuery = (ui: React.ReactElement) => {
    const queryClient = createQueryClient()
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    )
}

describe('AddressForm Component', () => {
    it('should render all form fields', () => {
        renderWithQuery(<AddressForm />)
        
        expect(screen.getByText('First Name *')).toBeInTheDocument()
        expect(screen.getByText('Last Name *')).toBeInTheDocument()
        expect(screen.getByText('Phone Number *')).toBeInTheDocument()
        expect(screen.getByText('City/Province *')).toBeInTheDocument()
        expect(screen.getByText('Street Name *')).toBeInTheDocument()
        expect(screen.getByText('House Number *')).toBeInTheDocument()
    })

    it('should render input fields', () => {
        renderWithQuery(<AddressForm />)
        
        const inputs = screen.getAllByTestId('input')
        expect(inputs.length).toBeGreaterThanOrEqual(6)
    })

    it('should render textarea for notes', () => {
        renderWithQuery(<AddressForm />)
        
        expect(screen.getByTestId('textarea')).toBeInTheDocument()
    })

    it('should render checkbox for default address', () => {
        renderWithQuery(<AddressForm />)
        
        expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })

    it('should render create address button', () => {
        renderWithQuery(<AddressForm />)
        
        expect(screen.getByText('Create Address')).toBeInTheDocument()
    })
})

describe('PaymentMethodList Component', () => {
    const mockMethods = [
        { id: '1', type: 'bank' as const, name: 'VCB', accountName: 'John Doe', accountNumber: '12345678', isDefault: true },
        { id: '2', type: 'bank' as const, name: 'BIDV', accountName: 'John Doe', accountNumber: '87654321', isDefault: false },
    ]

    it('should render empty list when no methods', () => {
        renderWithQuery(<PaymentMethodList type="bank" methods={[]} />)
        
        expect(screen.getByText('Linked bank accounts')).toBeInTheDocument()
    })

    it('should render payment methods', () => {
        renderWithQuery(<PaymentMethodList type="bank" methods={mockMethods} />)
        
        expect(screen.getByText('VCB')).toBeInTheDocument()
        expect(screen.getByText('BIDV')).toBeInTheDocument()
    })

    it('should call onUse when clicking use button', () => {
        const onUse = vi.fn()
        renderWithQuery(<PaymentMethodList type="bank" methods={mockMethods} onUse={onUse} />)
        
        const useButtons = screen.getAllByText('Use account')
        fireEvent.click(useButtons[0])
        
        expect(onUse).toHaveBeenCalledWith('1')
    })

    it('should render add new button', () => {
        const onAddNew = vi.fn()
        renderWithQuery(<PaymentMethodList type="bank" methods={mockMethods} onAddNew={onAddNew} />)
        
        expect(screen.getByText('Add bank card/account')).toBeInTheDocument()
    })

    it('should render wallet type correctly', () => {
        renderWithQuery(<PaymentMethodList type="wallet" methods={[]} />)
        
        expect(screen.getByText('Linked digital wallets')).toBeInTheDocument()
    })
})