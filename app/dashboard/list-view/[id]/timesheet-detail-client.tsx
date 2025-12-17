"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Plus, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
// import { ViewToggle } from "@/components/view-toggle" // Removed unused
import { DailyEntryModal } from "@/components/daily-entry-modal"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TimesheetDetails, DailyTask } from "@/lib/data"

interface TimesheetDetailClientProps {
    initialData: TimesheetDetails | null;
}

export function TimesheetDetailClient({ initialData }: TimesheetDetailClientProps) {
    const router = useRouter()
    const [data, setData] = useState<TimesheetDetails | null>(initialData)
    // No loading state needed if data is passed from server, but good for local updates if any.

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [editingTask, setEditingTask] = useState<DailyTask | null>(null)

    // Sync state if initialData updates (e.g. re-validation)
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    const handleAddTask = (date: Date) => {
        setSelectedDate(date)
        setEditingTask(null)
        setIsAddModalOpen(true)
    }

    const handleEditTask = (task: DailyTask) => {
        setEditingTask(task)
        setSelectedDate(task.date)
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
            typeOfWork: entryData.typeOfWork,
        }

        // Update state
        let updatedTasks;
        if (editingTask) {
            updatedTasks = data.tasks.map(t => t.id === editingTask.id ? { ...newTask, id: editingTask.id } : t)
        } else {
            updatedTasks = [...data.tasks, newTask]
        }

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-[22px] font-semibold text-[#111928] mb-1">This week's timesheet</h1>
                    <p className="text-sm text-[#9CA3AF]">{data.dateRange}</p>
                </div>
                <div className="w-48 text-right">
                    <div className="flex justify-between text-xs font-medium text-[#111928] mb-2">
                        <span>{data.hours}/40 hrs</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    {/* Custom Progress Bar */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#FF8A4C] transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Daily List */}
            <div className="space-y-0">
                {Array.from(daysMap.entries()).map(([dateStr, tasks]) => {
                    const date = new Date(dateStr)

                    return (
                        <div key={dateStr} className="flex gap-8 py-4 border-b border-gray-100 last:border-0">
                            {/* Date Column */}
                            <div className="w-20 flex-shrink-0 pt-1">
                                <div className="font-semibold text-[#111827] text-base">
                                    {date.toLocaleString('default', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Tasks Column */}
                            <div className="flex-grow space-y-2">
                                {tasks.map(task => (
                                    <div key={task.id} className="group flex items-center justify-between py-2 hover:bg-gray-50/50 transition-colors rounded-lg px-2 -mx-2">
                                        <div className="font-medium text-[#111827] text-sm">
                                            {task.description}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-[#9CA3AF]">{task.hours} hrs</span>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md px-2.5 py-0.5 text-xs font-medium border-0">
                                                {task.projectName}
                                            </Badge>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-gray-600">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg rounded-lg">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => {
                                                            const updatedTasks = data.tasks.filter(t => t.id !== task.id);
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
                                    className="w-full py-3 border border-dashed border-gray-200 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add new task
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
            <DailyEntryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveEntry}
                date={selectedDate}
                initialData={editingTask}
            />
        </div>
    )
}
