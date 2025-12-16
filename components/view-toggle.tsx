"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Table, List } from "lucide-react"

export function ViewToggle() {
    const pathname = usePathname()
    const isTableView = pathname?.includes("table-view")

    // Logic: 
    // If we are on table view -> active state for "Table View", inactive for "List View"
    // If we are on list view -> active state for "List View", inactive for "Table View"
    // Link to /dashboard/table-view for Table
    // Link to /dashboard/list-view/1 for List (Placeholder ID)

    return (
        <div className="flex items-center gap-6">
            <Link
                href="/dashboard/table-view"
                className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2",
                    isTableView
                        ? "text-black border-black"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                )}
            >
                <Table className="h-4 w-4" />
                Table View
            </Link>
            <div className="text-gray-200">|</div>
            <Link
                href="/dashboard/list-view/1"
                className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors pb-1 border-b-2",
                    !isTableView
                        ? "text-black border-black"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                )}
            >
                <List className="h-4 w-4" />
                List View
            </Link>
        </div>
    )
}
