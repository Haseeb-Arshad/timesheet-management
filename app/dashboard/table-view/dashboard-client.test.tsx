import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DashboardClient } from './dashboard-client'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn(),
    }),
    useSearchParams: () => ({
        get: vi.fn(),
        toString: vi.fn(),
    }),
}))

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: null,
        status: 'unauthenticated',
    }),
}))

describe('DashboardClient', () => {
    const mockData = [
        {
            id: 1,
            week: 1,
            dateRange: 'Oct 1 - Oct 5, 2024',
            hours: 40,
            status: 'completed',
            action: 'View',
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-10-05'),
        },
    ]

    it('renders the dashboard title and table headers', () => {
        render(
            <DashboardClient
                initialData={mockData}
                totalPages={1}
                currentPage={1}
                itemsPerPage={5}
                totalItems={1}
            />
        )

        expect(screen.getByText('Your Timesheets')).toBeDefined()
        expect(screen.getByText('Week #')).toBeDefined()
        expect(screen.getAllByText('Status').length).toBeGreaterThan(0)
    })

    it('renders the timesheet data', () => {
        render(
            <DashboardClient
                initialData={mockData}
                totalPages={1}
                currentPage={1}
                itemsPerPage={5}
                totalItems={1}
            />
        )

        expect(screen.getByText('Oct 1 - Oct 5, 2024')).toBeDefined()
        expect(screen.getByText('completed')).toBeDefined()
        expect(screen.getByText('View')).toBeDefined()
    })

    it('renders no results message when data is empty', () => {
        render(
            <DashboardClient
                initialData={[]}
                totalPages={0}
                currentPage={1}
                itemsPerPage={5}
                totalItems={0}
            />
        )

        expect(screen.getByText('No results found.')).toBeDefined()
    })
})
