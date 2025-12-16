"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
// import { getTimesheetDetails, TimesheetDetails } from "@/lib/data" // We will define DailyTask interface here or import it if compatible
import { getTimesheetDetails } from "@/lib/data"
import { ChevronLeft, Plus, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ViewToggle } from "@/components/view-toggle"
import { DailyEntryModal } from "@/components/daily-entry-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Re-defining interface locally to avoid data.ts strictness if needed, or better yet, match it.
// Assuming data.ts exports:
import { TimesheetDetails, DailyTask } from "@/lib/data"

export default function TimesheetDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id ? parseInt(params.id as string) : null
    const [data, setData] = useState<TimesheetDetails | null>(null)
    const [loading, setLoading] = useState(true)

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    useEffect(() => {
        if (id) {
            const details = getTimesheetDetails(id)
            setData(details)
            setLoading(false)
        }
    }, [id])

    const handleAddTask = (date: Date) => {
        setSelectedDate(date)
        setIsAddModalOpen(true)
    }

    const handleSaveEntry = (entryData: any) => {
        if (!data || !selectedDate) return;

        const newTask: DailyTask = {
            id: Math.random().toString(36).substr(2, 9),
            date: selectedDate, // Use the selected date
            projectName: entryData.project,
            description: entryData.description,
            hours: entryData.hours,
            status: "Pending"
        }

        // Update state
        const updatedTasks = [...data.tasks, newTask]

        // Recalc totals
        const newTotalHours = updatedTasks.reduce((sum, t) => sum + t.hours, 0)
        let newStatus = data.status
        if (newTotalHours >= 40) newStatus = "completed"
        else if (newTotalHours > 0) newStatus = "incomplete"

        setData({
            ...data,
            tasks: updatedTasks,
            hours: newTotalHours,
            status: newStatus
        })
    }

    if (loading) return <div className="p-10 text-center">Loading...</div>
    if (!data) return <div className="p-10 text-center">Timesheet not found</div>

    const progressPercentage = Math.min((data.hours / 40) * 100, 100)

    const daysMap = new Map<string, typeof data.tasks>()

    // Generate 5 days starting from startDate
    for (let i = 0; i < 5; i++) {
        const d = new Date(data.startDate)
        d.setDate(d.getDate() + i)
        const key = d.toDateString()
        daysMap.set(key, [])
    }

    // Populate map
    data.tasks.forEach(task => {
        const key = task.date.toDateString()
        if (daysMap.has(key)) {
            daysMap.get(key)?.push(task)
        }
    })

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            {/* Header removed - in Layout */}

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Summary Section */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">This week's timesheet</h1>
                            <p className="text-sm text-gray-500">{data.dateRange}</p>
                        </div>
                        <div className="w-1/3 text-right">
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                <span>{data.hours}/40 hrs</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            {/* Custom Progress Bar specific to design */}
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#FF7F50] transition-all duration-500 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Daily List */}
                    <div className="space-y-6">
                        {Array.from(daysMap.entries()).map(([dateStr, tasks]) => {
                            const date = new Date(dateStr)

                            return (
                                <div key={dateStr} className="flex flex-col md:flex-row gap-4 border-b border-gray-50 pb-6 last:border-0">
                                    {/* Date Column */}
                                    <div className="md:w-32 flex-shrink-0 pt-2">
                                        <div className="font-bold text-gray-900 text-lg">
                                            {date.toLocaleString('default', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* Tasks Column */}
                                    <div className="flex-grow space-y-3">
                                        {tasks.map(task => (
                                            <div key={task.id} className="group flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 hover:border-blue-200 transition-colors shadow-sm">
                                                <div className="font-medium text-gray-900 text-sm">
                                                    {task.description}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-400 font-medium">{task.hours} hrs</span>
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md px-2 py-0.5 text-xs font-semibold">
                                                        {task.projectName}
                                                    </Badge>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-gray-600">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { /* Edit Logic Placeholder */ }}>
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => {
                                                                    const updatedTasks = data.tasks.filter(t => t.id !== task.id);
                                                                    // Recalc
                                                                    const newTotalHours = updatedTasks.reduce((sum, t) => sum + t.hours, 0)
                                                                    let newStatus = data.status
                                                                    if (newTotalHours >= 40) newStatus = "completed"
                                                                    else if (newTotalHours > 0) newStatus = "incomplete"
                                                                    else newStatus = "missing"

                                                                    setData({ ...data, tasks: updatedTasks, hours: newTotalHours, status: newStatus })
                                                                }}
                                                            >
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Task Button */}
                                        <button
                                            onClick={() => handleAddTask(date)}
                                            className="w-full py-3 my-2 border border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            Add new task
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="text-center text-xs text-gray-400">
                    © 2024 tentwenty. All rights reserved.
                </div>
            </main>

            <DailyEntryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveEntry}
                date={selectedDate}
            />
        </div>
    )
}
