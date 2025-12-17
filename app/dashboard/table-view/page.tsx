
import { getAllTimesheets } from "@/lib/data"
import { DashboardClient } from "./dashboard-client"

interface PageProps {
    searchParams: Promise<{
        page?: string
        limit?: string
        status?: string
        dateStart?: string
        dateEnd?: string
        sortField?: string
        sortOrder?: 'asc' | 'desc'
    }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 5
    const status = params.status || "all"
    const dateStart = params.dateStart || null
    const dateEnd = params.dateEnd || null
    const sortField = params.sortField || null
    const sortOrder = params.sortOrder || 'asc'

    const { data, totalPages, total } = await getAllTimesheets({
        page,
        limit,
        status,
        dateStart,
        dateEnd,
        sortField,
        sortOrder
    })

    return (
        <div className="min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                <DashboardClient
                    initialData={data}
                    totalPages={totalPages}
                    currentPage={page}
                    itemsPerPage={limit}
                    totalItems={total}
                />
                {/* Footer */}
                <footer className="py-8 text-center">
                    <p className="text-sm text-[#6B7280]">© 2024 tentwenty. All rights reserved.</p>
                </footer>
            </main>
        </div>
    )
}
