"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// For now, we'll use placeholder icons. In real implementation, install lucide-react.
import { ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

// Mock Data matching the image
const INITIAL_DATA = [
    { id: 1, week: 1, dateRange: "1 - 5 January, 2024", status: "completed", action: "View" },
    { id: 2, week: 2, dateRange: "8 - 12 January, 2024", status: "completed", action: "View" },
    { id: 3, week: 3, dateRange: "15 - 19 January, 2024", status: "incomplete", action: "Update" },
    { id: 4, week: 4, dateRange: "22 - 26 January, 2024", status: "completed", action: "View" },
    { id: 5, week: 5, dateRange: "28 January - 1 February, 2024", status: "missing", action: "Create" },
]

export default function DashboardPage() {
    const { data: session } = useSession()
    const [data] = useState(INITIAL_DATA)

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-bold tracking-tight text-black">ticktock</span>
                        <nav className="hidden md:flex gap-6">
                            <a href="#" className="text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-black transition-colors">Timesheets</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User Dropdown Trigger */}
                        <DropdownMenuTrigger name={session?.user?.name || "John Doe"} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your Timesheets</h1>
                </div>

                {/* Filters and Controls */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <SelectTrigger placeholder="Date Range" />
                        <SelectTrigger placeholder="Status" />
                    </div>
                </div>

                {/* Timesheet Table */}
                <div className="rounded-md border bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[100px]">
                                    <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
                                        <span>Week #</span>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
                                        <span>Date</span>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>
                                    <div className="flex items-center space-x-1 cursor-pointer hover:text-gray-700">
                                        <span>Status</span>
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell className="font-medium text-gray-900">{row.week}</TableCell>
                                    <TableCell className="text-gray-600">{row.dateRange}</TableCell>
                                    <TableCell>
                                        <Badge variant={row.status as any}>
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                                        >
                                            {row.action}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <SelectTrigger placeholder="5 per page" className="h-8 w-[120px] text-xs" />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200">
                                Previous
                            </Button>
                            <div className="flex items-center">
                                <Button variant="ghost" size="sm" className="h-8 w-8 text-xs bg-blue-50 text-blue-600 font-bold">1</Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-gray-600">2</Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-gray-600">3</Button>
                                <span className="text-gray-400 text-xs px-1">...</span>
                                <Button variant="ghost" size="sm" className="h-8 w-8 text-xs text-gray-600">99</Button>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs border-gray-200">
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-sm text-gray-400">
                © 2024 tentwenty. All rights reserved.
            </footer>
        </div>
    )
}

function DropdownMenuTrigger({ name }: { name: string }) {
    return (
        <button className="flex items-center text-sm font-medium text-gray-700 gap-1 hover:text-black">
            {name}
            <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
    )
}

function SelectTrigger({ placeholder, className }: { placeholder: string, className?: string }) {
    return (
        <button className={cn("flex items-center justify-between w-[180px] h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100", className)}>
            <span>{placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}
