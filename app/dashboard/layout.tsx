"use client"

import { useSession } from "next-auth/react"
import { ChevronDown } from "lucide-react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session } = useSession()

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-6 h-[56px] flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-semibold tracking-tight text-gray-900">ticktock</span>
                        <nav className="hidden md:flex gap-6 items-center">
                            <span className="text-[14px] font-medium text-gray-900">Timesheets</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenuTrigger name={session?.user?.name || "John Doe"} />
                    </div>
                </div>
            </header>

            {children}
        </div>
    )
}

function DropdownMenuTrigger({ name }: { name: string }) {
    return (
        <button className="flex items-center text-sm font-medium text-gray-600 gap-1 hover:text-gray-900">
            {name}
            <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
    )
}

