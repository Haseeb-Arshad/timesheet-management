
import { getTimesheetDetails } from "@/lib/data"
import { TimesheetDetailClient } from "./timesheet-detail-client"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function TimesheetDetailPage({ params }: PageProps) {
    const { id: paramId } = await params
    const id = parseInt(paramId)
    // Example: Retrieve token from session or headers
    const token = "mock-token-from-session"
    const data = await getTimesheetDetails(id, token)

    return (
        <div className="min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                <TimesheetDetailClient initialData={data} />
                {/* Footer */}
                <footer className="py-8 text-center">
                    <p className="text-sm text-gray-400">© 2024 tentwenty. All rights reserved.</p>
                </footer>
            </main>
        </div>
    )
}
