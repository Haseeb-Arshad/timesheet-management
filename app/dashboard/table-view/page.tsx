"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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

// Generate dummy entries
const INITIAL_DATA = Array.from({ length: 200 }).map((_, i) => {
    const id = i + 1;
    const week = id;
    const startDay = ((id - 1) * 7) % 28 + 1;
    const endDay = startDay + 4;
    const month = "January";
    const year = 2024;

    const dateRange = `${startDay} - ${endDay} ${month}, ${year}`;

    // Random status logic
    const rand = Math.random();
    let status = "missing";
    if (rand > 0.66) status = "completed";
    else if (rand > 0.33) status = "incomplete";

    let action = "View";
    if (status === "incomplete") action = "Update";
    if (status === "missing") action = "Create";

    const start = new Date(2024, 0, startDay);
    const end = new Date(2024, 0, endDay);

    return {
        id,
        week,
        dateRange,
        status,
        action,
        startDate: start,
        endDate: end
    };
});

type SortField = 'week' | 'dateRange' | 'status';
type SortOrder = 'asc' | 'desc';

export default function DashboardPage() {
    const { data: session } = useSession()
    const [data, setData] = useState(INITIAL_DATA)
    const [sortField, setSortField] = useState<SortField | null>(null)
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    // Filter State
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [dateStart, setDateStart] = useState<string>("")
    const [dateEnd, setDateEnd] = useState<string>("")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "update" | "view">("view")
    const [currentTimesheet, setCurrentTimesheet] = useState<any>(null)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)

    // Derived Data (Filtering & Sorting)
    const filteredAndSortedData = useMemo(() => {
        let processed = [...data];

        // 1. Filter by Status
        if (statusFilter !== "all") {
            processed = processed.filter(item => item.status === statusFilter);
        }

        // 2. Filter by Date Range
        if (dateStart && dateEnd) {
            const start = new Date(dateStart);
            const end = new Date(dateEnd);
            processed = processed.filter(item =>
                item.startDate <= end && item.endDate >= start
            );
        }

        // 3. Sort
        if (sortField) {
            processed.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                if (sortField === 'dateRange') {
                    aValue = a.startDate.getTime();
                    bValue = b.startDate.getTime();
                }

                if (aValue === bValue) return 0;
                const compare = aValue > bValue ? 1 : -1;
                return sortOrder === 'asc' ? compare : -compare;
            });
        }

        return processed;
    }, [data, sortField, sortOrder, statusFilter, dateStart, dateEnd]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedData.slice(start, start + itemsPerPage);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    // Reset page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [statusFilter, dateStart, dateEnd, itemsPerPage]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const router = useRouter()

    const handleAction = (row: any) => {
        if (row.action === "Create" || row.action === "Update") {
            setCurrentTimesheet(row)
            setModalMode(row.action === "Create" ? "create" : "update")
            setIsModalOpen(true)
        } else {
            router.push(`/dashboard/${row.id}`)
        }
    }

    const handleModalSubmit = (formData: any) => {
        const updatedData = data.map(item =>
            item.id === currentTimesheet.id
                ? {
                    ...item,
                    status: formData.status,
                    week: formData.week,
                    dateRange: formData.dateRange,
                    action: formData.status === 'completed' ? 'View' : 'Update'
                }
                : item
        )
        setData(updatedData)
        setIsModalOpen(false)
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
                return 'bg-gray-100 text-gray-700';
        }
    }

    return (
        <div className="min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                {/* White Card Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Title */}
                    <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Your Timesheets</h1>

                    {/* Filters */}
                    <div className="flex gap-3 mb-6 items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-white text-sm shadow-sm transition-all hover:border-gray-300 hover:shadow justify-start text-left font-normal min-w-[140px]",
                                        !dateStart && "text-gray-500"
                                    )}
                                >
                                    {dateStart && dateEnd
                                        ? `${dateStart} - ${dateEnd}`
                                        : "Date Range"}
                                    <ChevronDown className="absolute right-2.5 h-4 w-4 text-gray-400" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 bg-white z-50 shadow-xl rounded-xl border border-gray-200" align="start">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 leading-none">Date Range</h4>
                                        <p className="text-sm text-gray-500">Filter timesheets by date range.</p>
                                    </div>
                                    <div className="grid gap-3">
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label htmlFor="start" className="text-gray-700">Start</Label>
                                            <Input
                                                id="start"
                                                type="date"
                                                className="col-span-2 h-9 rounded-lg border-gray-200"
                                                value={dateStart}
                                                onChange={(e) => setDateStart(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 items-center gap-4">
                                            <Label htmlFor="end" className="text-gray-700">End</Label>
                                            <Input
                                                id="end"
                                                type="date"
                                                className="col-span-2 h-9 rounded-lg border-gray-200"
                                                value={dateEnd}
                                                onChange={(e) => setDateEnd(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <FilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            placeholder="Status"
                            options={[
                                { label: "All Statuses", value: "all" },
                                { label: "Completed", value: "completed" },
                                { label: "Incomplete", value: "incomplete" },
                                { label: "Missing", value: "missing" },
                            ]}
                        />

                        {(dateStart || statusFilter !== "all") && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setStatusFilter("all")
                                    setDateStart("")
                                    setDateEnd("")
                                    setCurrentPage(1)
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
                                <TableRow className="border-b border-gray-200 hover:bg-transparent">
                                    <TableHead className="w-[120px] py-3">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => handleSort('week')}
                                        >
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Week #</span>
                                            <ArrowDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-3">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => handleSort('dateRange')}
                                        >
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</span>
                                            <ArrowDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="py-3">
                                        <div
                                            className="flex items-center gap-1 cursor-pointer"
                                            onClick={() => handleSort('status')}
                                        >
                                            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</span>
                                            <ArrowDown className="h-3 w-3 text-gray-400" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right py-3">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((row) => (
                                    <TableRow key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                        <TableCell className="font-medium text-gray-900 py-4 w-[120px]">{row.week}</TableCell>
                                        <TableCell className="text-gray-600 py-4 text-sm">{row.dateRange}</TableCell>
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
                                {paginatedData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                            No results found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                        <div className="relative inline-block">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="appearance-none h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 shadow-sm transition-all hover:bg-white hover:shadow"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>

                        <PaginationCustom
                            currentPage={currentPage}
                            totalPages={totalPages || 1}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 text-center">
                    <p className="text-sm text-gray-400">© 2024 tentwenty. All rights reserved.</p>
                </footer>
            </main>

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

function FilterSelect({
    value,
    onChange,
    options,
    placeholder
}: {
    value: string,
    onChange: (val: string) => void,
    options: { label: string, value: string }[],
    placeholder: string
}) {
    return (
        <div className="relative inline-block">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none h-[36px] px-3 pr-8 rounded-lg border border-[#E5E7EB] bg-white text-sm text-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 shadow-sm transition-all hover:border-gray-300 hover:shadow min-w-[120px]"
            >
                <option value="" disabled hidden>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    )
}

