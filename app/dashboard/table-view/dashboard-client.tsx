"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ChevronDown, ArrowDown, X } from "lucide-react"
import { TimesheetModal } from "@/components/timesheet-modal"
import { PaginationCustom } from "@/components/ui/pagination-custom"
import { TimesheetSummary } from "@/lib/data"

type SortField = 'week' | 'dateRange' | 'status';
type SortOrder = 'asc' | 'desc';

interface DashboardClientProps {
    initialData: TimesheetSummary[];
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
}

export function DashboardClient({ initialData, totalPages, currentPage, itemsPerPage, totalItems }: DashboardClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Read initial state from props/URL params
    // Note: Data is passed from server, so we don't strictly need local state for it unless we do optimistic updates.
    // However, keeping local state allows for smooth transitions or optimistic UI if we wanted. 
    // For this simple implementation, we'll rely on props to drive the table.

    // Filter State (Local for inputs, then push to URL on change/blur)
    const [dateStart, setDateStart] = useState<string>(searchParams.get("dateStart") || "")
    const [dateEnd, setDateEnd] = useState<string>(searchParams.get("dateEnd") || "")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "update" | "view">("view")
    const [currentTimesheet, setCurrentTimesheet] = useState<any>(null)

    const updateUrl = (params: Record<string, string | number | null>) => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "") {
                newSearchParams.delete(key)
            } else {
                newSearchParams.set(key, String(value))
            }
        })
        router.push(`?${newSearchParams.toString()}`)
    }

    const handleSort = (field: SortField) => {
        const currentSortField = searchParams.get("sortField")
        const currentSortOrder = searchParams.get("sortOrder")

        let newOrder = 'asc'
        if (currentSortField === field && currentSortOrder === 'asc') {
            newOrder = 'desc'
        }

        updateUrl({ sortField: field, sortOrder: newOrder })
    }

    const handleAction = (row: any) => {
        if (row.action === "Create" || row.action === "Update") {
            setCurrentTimesheet(row)
            setModalMode(row.action === "Create" ? "create" : "update")
            setIsModalOpen(true)
        } else {
            router.push(`/dashboard/list-view/${row.id}`)
        }
    }

    const handleModalSubmit = (formData: any) => {
        // Optimistic update could happen here, or just refresh
        // For now, we'll just close modal and maybe refresh
        setIsModalOpen(false)
        router.refresh()
    }

    const getStatusBadgeClasses = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-[#D1FAE5] text-[#065F46]';
            case 'incomplete':
                return 'bg-[#FEF3C7] text-[#92400E]';
            case 'missing':
                return 'bg-[#FEE2E2] text-[#991B1B]';
            default:
                return 'bg-gray-100 text-[#6B7280]';
        }
    }

    const pendingStatus = searchParams.get("status") || "all"

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <h1 className="text-[22px] font-semibold text-[#111928] mb-6">Your Timesheets</h1>

            {/* Filters */}
            <div className="flex gap-3 mb-6 items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "relative h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-white text-sm transition-all hover:border-gray-300 hover:shadow justify-start text-left font-normal min-w-[140px]",
                                !dateStart && "text-[#6B7280]"
                            )}
                        >
                            {dateStart && dateEnd
                                ? `${dateStart} - ${dateEnd}`
                                : "Date Range"}
                            <ChevronDown className="absolute right-2.5 h-4 w-4 text-[#6B7280]" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-white z-50 shadow-xl rounded-xl border border-gray-200" align="start">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-[#6B7280] leading-none">Date Range</h4>
                                <p className="text-sm text-[#6B7280]">Filter timesheets by date range.</p>
                            </div>
                            <div className="grid gap-3">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="start" className="text-[#6B7280]">Start</Label>
                                    <Input
                                        id="start"
                                        type="date"
                                        className="col-span-2 h-9 rounded-lg border-gray-200"
                                        value={dateStart}
                                        onChange={(e) => {
                                            setDateStart(e.target.value)
                                            updateUrl({ dateStart: e.target.value })
                                        }}
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="end" className="text-[#6B7280]">End</Label>
                                    <Input
                                        id="end"
                                        type="date"
                                        className="col-span-2 h-9 rounded-lg border-gray-200"
                                        value={dateEnd}
                                        onChange={(e) => {
                                            setDateEnd(e.target.value)
                                            updateUrl({ dateEnd: e.target.value })
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Status Filter Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "relative h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-white text-sm transition-all hover:border-gray-300 hover:shadow justify-start text-left font-normal min-w-[120px]",
                                pendingStatus === "all" && "text-[#6B7280]"
                            )}
                        >
                            {pendingStatus === "all" ? "Status" : pendingStatus.charAt(0).toUpperCase() + pendingStatus.slice(1)}
                            <ChevronDown className="absolute right-2.5 h-4 w-4 text-[#6B7280]" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 bg-white z-50 rounded-xl border border-gray-200 text-[#6B7280]" align="start">
                        <div className="flex flex-col gap-1">
                            {[
                                { label: "All Statuses", value: "all" },
                                { label: "Completed", value: "completed" },
                                { label: "Incomplete", value: "incomplete" },
                                { label: "Missing", value: "missing" },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateUrl({ status: option.value, page: 1 })}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                        pendingStatus === option.value
                                            ? "bg-blue-50 text-blue-700 font-medium"
                                            : "text-[#6B7280] hover:bg-gray-50"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                {(dateStart || pendingStatus !== "all") && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setDateStart("")
                            setDateEnd("")
                            updateUrl({ status: "all", dateStart: null, dateEnd: null, page: 1 })
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-[36px] px-3"
                    >
                        <X className="mr-1.5 h-4 w-4" /> Clear
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-200 hover:bg-transparent bg-[#F9FAFB]">
                            <TableHead className="w-[120px] py-3 bg-[#F9FAFB]">
                                <div
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => handleSort('week')}
                                >
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Week #</span>
                                    <ArrowDown className="h-3 w-3 text-[#6B7280]" />
                                </div>
                            </TableHead>
                            <TableHead className="py-3 bg-[#F9FAFB]">
                                <div
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => handleSort('dateRange')}
                                >
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Date</span>
                                    <ArrowDown className="h-3 w-3 text-[#6B7280]" />
                                </div>
                            </TableHead>
                            <TableHead className="py-3 bg-[#F9FAFB]">
                                <div
                                    className="flex items-center gap-1 cursor-pointer"
                                    onClick={() => handleSort('status')}
                                >
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Status</span>
                                    <ArrowDown className="h-3 w-3 text-[#6B7280]" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right py-3 bg-[#F9FAFB]">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.map((row) => (
                            <TableRow key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                <TableCell className="font-medium text-[#111928] py-4 w-[120px] bg-[#F9FAFB]">{row.week}</TableCell>
                                <TableCell className="text-[#6B7280] py-4 text-sm">{row.dateRange}</TableCell>
                                <TableCell className="py-4">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide",
                                        getStatusBadgeClasses(row.status)
                                    )}>
                                        {row.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <button
                                        onClick={() => handleAction(row)}
                                        className="text-[#2563EB] hover:text-blue-700 font-medium text-sm"
                                    >
                                        {row.action}
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-[#6B7280]">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 mt-4 gap-4 sm:gap-0">
                <div className="relative inline-block">
                    <select
                        value={itemsPerPage}
                        onChange={(e) => updateUrl({ limit: e.target.value, page: 1 })}
                        className="appearance-none h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#6B7280] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 shadow-sm transition-all hover:bg-white hover:shadow"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280] pointer-events-none" />
                </div>

                <PaginationCustom
                    currentPage={currentPage}
                    totalPages={totalPages || 1}
                    onPageChange={(p) => updateUrl({ page: p })}
                />
            </div>
            <TimesheetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={currentTimesheet}
                mode={modalMode}
            />
        </div>
    )
}
