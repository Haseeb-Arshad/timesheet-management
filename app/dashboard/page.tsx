
"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
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
import { ChevronDown, ArrowUpDown, X } from "lucide-react"
import { TimesheetModal } from "@/components/timesheet-modal"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Helper to parse date string "5 January" to Date object
// Assuming year 2024 for simplicity as in original data
function parseDateRange(rangeStr: string): { start: Date, end: Date } {
    // Format: "1 - 5 January, 2024" or "28 January - 1 February, 2024"
    const parts = rangeStr.split(' - ');
    const endParts = parts[1].split(', ');
    const year = parseInt(endParts[1]) || 2024;

    // Parse Start
    const startStr = parts[0] + " " + year;
    // Handle cross month case like "28 January" -> "28 January 2024"
    // If start part contains month, use it.
    let startDate = new Date(startStr);

    // Parse End
    const endDate = new Date(endParts[0] + " " + year);

    // Naive parsing correction for multi-month
    // Only re-parse if invalid
    if (isNaN(startDate.getTime())) {
        // fallback or more complex parsing needed for "28 January" in "28 January - 1 February"
        // The random generator makes predictable strings, so we can try to be robust
        // If parts[0] is just "1", it implies same month as end.
        if (!parts[0].includes(" ")) {
            const endMonth = endParts[0].split(" ")[1];
            startDate = new Date(parts[0] + " " + endMonth + " " + year);
        }
    }

    return { start: startDate, end: endDate };
}

// Generate 200 dummy entries with random HOURS
const INITIAL_DATA = Array.from({ length: 200 }).map((_, i) => {
    const id = i + 1;
    const week = Math.ceil(id / 5);
    const start = new Date(2024, 0, 1 + (id * 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 4);

    const dateRange = `${start.getDate()} ${start.toLocaleString('default', { month: 'long' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'long' })}, ${end.getFullYear()} `;

    // Random Hours Logic
    // 33% chance 40 hours, 33% 0, 33% random 1-39
    const rand = Math.random();
    let hours = 0;
    if (rand > 0.66) hours = 40;
    else if (rand > 0.33) hours = Math.floor(Math.random() * 39) + 1;
    else hours = 0;

    let status = "missing";
    if (hours === 40) status = "completed";
    else if (hours > 0) status = "incomplete";

    let action = "View";
    if (status === "incomplete") action = "Update";
    if (status === "missing") action = "Create";

    return {
        id,
        week,
        dateRange,
        hours, // Added hours
        status,
        action,
        startDate: start, // Keep date objs for easier filtering
        endDate: end
    };
});

type SortField = 'week' | 'dateRange' | 'status' | 'hours';
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
            // Show item if its range INTERSECTS with selected range
            // item.start <= filter.end AND item.end >= filter.start
            processed = processed.filter(item =>
                item.startDate <= end && item.endDate >= start
            );
        }

        // 3. Sort
        if (sortField) {
            processed.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Custom sort for non-string
                if (sortField === 'dateRange') {
                    aValue = a.startDate.getTime();
                    bValue = b.startDate.getTime();
                }

                if (aValue === bValue) return 0;
                const compare = aValue > bValue ? 1 : -1;
                return sortOrder === 'asc' ? compare : -compare * -1;
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

    const handleAction = (row: any) => {
        setCurrentTimesheet(row)
        if (row.action === "Create") setModalMode("create")
        else if (row.action === "Update") setModalMode("update")
        else setModalMode("view")
        setIsModalOpen(true)
    }

    const handleModalSubmit = (formData: any) => {
        const updatedData = data.map(item =>
            item.id === currentTimesheet.id
                ? {
                    ...item,
                    hours: formData.hours,
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

    const clearFilters = () => {
        setStatusFilter("all")
        setDateStart("")
        setDateEnd("")
        setCurrentPage(1)
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <span className="text-2xl font-bold tracking-tight text-black">ticktock</span>
                        <nav className="hidden md:flex gap-6">
                            <a href="#" className="text-[14px] font-medium text-gray-400 hover:text-gray-900 transition-colors">Timesheets</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenuTrigger name={session?.user?.name || "John Doe"} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                <div className="flex flex-col space-y-2">
                    <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">Your Timesheets</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-1 rounded-lg">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !dateStart && "text-muted-foreground")}>
                                {dateStart ? `${dateStart} - ${dateEnd || '...'}` : "Filter by Date Range"}
                                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Date Range</h4>
                                    <p className="text-sm text-muted-foreground">Show weeks that intersect with this range.</p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="start">Start</Label>
                                        <Input id="start" type="date" className="col-span-2 h-8" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="end">End</Label>
                                        <Input id="end" type="date" className="col-span-2 h-8" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
                                    </div>
                                    <Button size="sm" onClick={() => { /* Close could happen auto if wanted */ }} className="mt-2">Apply</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <FilterSelect
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[
                            { label: "All Statuses", value: "all" },
                            { label: "Completed", value: "completed" },
                            { label: "Incomplete", value: "incomplete" },
                            { label: "Missing", value: "missing" },
                        ]}
                    />

                    {(dateStart || statusFilter !== "all") && (
                        <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <X className="mr-2 h-4 w-4" /> Clear Filters
                        </Button>
                    )}
                </div>

                {/* Timesheet Table */}
                <div className="rounded-lg border border-gray-100 shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-[#F9FAFB] hover:bg-[#F9FAFB] border-b border-gray-100 h-10">
                                <TableHead className="w-[100px] py-2">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group"
                                        onClick={() => handleSort('week')}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Week #</span>
                                        <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-2">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group"
                                        onClick={() => handleSort('dateRange')}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Date</span>
                                        <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-2">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group"
                                        onClick={() => handleSort('hours')}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Hours</span>
                                        <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-2">
                                    <div
                                        className="flex items-center gap-1 cursor-pointer hover:text-gray-700 group"
                                        onClick={() => handleSort('status')}
                                    >
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</span>
                                        <ArrowUpDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right py-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mr-2">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((row) => (
                                <TableRow key={row.id} className="h-16 border-b border-gray-50 hover:bg-gray-50/50">
                                    <TableCell className="font-medium text-gray-900 py-4 w-[100px]">{row.week}</TableCell>
                                    <TableCell className="text-gray-600 py-4 text-sm">{row.dateRange}</TableCell>
                                    <TableCell className="text-gray-600 py-4 font-mono text-sm">{row.hours}h</TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant={row.status as any} className="uppercase px-2.5 py-1 text-[10px] font-bold tracking-wide border-0 shadow-none">
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right py-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleAction(row)}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-transparent font-medium text-sm h-auto p-0 pr-4"
                                        >
                                            {row.action}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
                        <div className="flex items-center">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="h-9 w-[110px] text-xs border-transparent bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 px-2 cursor-pointer focus:outline-none"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            <div className="flex items-center px-2 gap-1 text-xs text-gray-600">
                                <span>Page {currentPage} of {totalPages || 1}</span>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-md"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                <footer className="py-12 text-center">
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

function DropdownMenuTrigger({ name }: { name: string }) {
    return (
        <button className="flex items-center text-sm font-medium text-gray-500 gap-1 hover:text-black">
            {name}
            <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
    )
}

function FilterSelect({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { label: string, value: string }[] }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-[160px] h-10 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
    )
}

