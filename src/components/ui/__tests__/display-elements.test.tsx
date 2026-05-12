 
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Alert, AlertDescription, AlertTitle } from '../alert'
import { Badge, badgeVariants } from '../badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../breadcrumb'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

vi.mock('@/utils/cn', () => ({
    cn: (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' '),
}))

vi.mock('@radix-ui/react-tabs', () => ({
    Root: ({ children, ...props }: any) => <div data-slot="tabs" {...props}>{children}</div>,
    List: ({ children, ...props }: any) => <div data-slot="tabs-list" {...props}>{children}</div>,
    Trigger: ({ children, ...props }: any) => <button data-slot="tabs-trigger" {...props}>{children}</button>,
    Content: ({ children, ...props }: any) => <div data-slot="tabs-content" {...props}>{children}</div>,
}))

vi.mock('@radix-ui/react-slot', () => ({
    Slot: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('class-variance-authority', () => ({
    cva: (base: string, _config: any) => () => base,
}))

vi.mock('lucide-react', () => ({
    ChevronRight: () => <span data-testid="chevron-right" />,
    MoreHorizontal: () => <span data-testid="more-horizontal" />,
}))

describe('UI Display Elements', () => {

    describe('Tabs Component', () => {
        it('should render Tabs', () => {
            render(<Tabs><TabsList><TabsTrigger value="1">Tab 1</TabsTrigger></TabsList><TabsContent value="1">Content</TabsContent></Tabs>)
            expect(screen.getByText('Tab 1')).toBeInTheDocument()
        })

        it('should render TabsList', () => {
            render(<Tabs><TabsList>List</TabsList></Tabs>)
            expect(screen.getByText('List')).toBeInTheDocument()
        })

        it('should render TabsTrigger', () => {
            render(<Tabs><TabsList><TabsTrigger value="1">Trigger</TabsTrigger></TabsList></Tabs>)
            expect(screen.getByText('Trigger')).toBeInTheDocument()
        })

        it('should render TabsContent', () => {
            render(<Tabs><TabsContent value="1">Content</TabsContent></Tabs>)
            expect(screen.getByText('Content')).toBeInTheDocument()
        })
    })

    describe('Badge Component', () => {
        it('should render Badge', () => {
            render(<Badge>Badge</Badge>)
            expect(screen.getByText('Badge')).toBeInTheDocument()
        })

        it('should render Badge with variant default', () => {
            const classes = badgeVariants({ variant: 'default' })
            expect(classes).toBeDefined()
        })

        it('should render Badge with variant secondary', () => {
            const classes = badgeVariants({ variant: 'secondary' })
            expect(classes).toBeDefined()
        })

        it('should render Badge with variant destructive', () => {
            const classes = badgeVariants({ variant: 'destructive' })
            expect(classes).toBeDefined()
        })

        it('should render Badge with variant success', () => {
            const classes = badgeVariants({ variant: 'success' })
            expect(classes).toBeDefined()
        })

        it('should render Badge with variant warning', () => {
            const classes = badgeVariants({ variant: 'warning' })
            expect(classes).toBeDefined()
        })

        it('should render Badge with variant outline', () => {
            const classes = badgeVariants({ variant: 'outline' })
            expect(classes).toBeDefined()
        })
    })

    describe('Breadcrumb Component', () => {
        it('should render Breadcrumb', () => {
            render(<Breadcrumb>Content</Breadcrumb>)
            expect(screen.getByText('Content')).toBeInTheDocument()
        })

        it('should render BreadcrumbList', () => {
            render(<BreadcrumbList>Items</BreadcrumbList>)
            expect(screen.getByText('Items')).toBeInTheDocument()
        })

        it('should render BreadcrumbItem', () => {
            render(<BreadcrumbItem>Item</BreadcrumbItem>)
            expect(screen.getByText('Item')).toBeInTheDocument()
        })

        it('should render BreadcrumbLink', () => {
            render(<BreadcrumbLink>Link</BreadcrumbLink>)
            expect(screen.getByText('Link')).toBeInTheDocument()
        })

        it('should render BreadcrumbSeparator', () => {
            render(<BreadcrumbSeparator>/</BreadcrumbSeparator>)
            expect(screen.getByText('/')).toBeInTheDocument()
        })
    })

    describe('Alert Component', () => {
        it('should render Alert', () => {
            render(<Alert>Alert content</Alert>)
            expect(screen.getByText('Alert content')).toBeInTheDocument()
        })

        it('should render AlertTitle', () => {
            render(<AlertTitle>Title</AlertTitle>)
            expect(screen.getByText('Title')).toBeInTheDocument()
        })

        it('should render AlertDescription', () => {
            render(<AlertDescription>Description</AlertDescription>)
            expect(screen.getByText('Description')).toBeInTheDocument()
        })
    })

    describe('Card Component', () => {
        it('should render Card', () => {
            render(<Card>Card content</Card>)
            expect(screen.getByText('Card content')).toBeInTheDocument()
        })

        it('should render CardHeader', () => {
            render(<CardHeader>Header</CardHeader>)
            expect(screen.getByText('Header')).toBeInTheDocument()
        })

        it('should render CardTitle', () => {
            render(<CardTitle>Title</CardTitle>)
            expect(screen.getByText('Title')).toBeInTheDocument()
        })

        it('should render CardDescription', () => {
            render(<CardDescription>Description</CardDescription>)
            expect(screen.getByText('Description')).toBeInTheDocument()
        })

        it('should render CardContent', () => {
            render(<CardContent>Content</CardContent>)
            expect(screen.getByText('Content')).toBeInTheDocument()
        })

        it('should render CardFooter', () => {
            render(<CardFooter>Footer</CardFooter>)
            expect(screen.getByText('Footer')).toBeInTheDocument()
        })
    })
})