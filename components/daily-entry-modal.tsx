"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Info } from "lucide-react"

interface DailyEntryModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => void
    date?: Date | null
    initialData?: any
}

export function DailyEntryModal({ isOpen, onClose, onSave, date, initialData }: DailyEntryModalProps) {
    const [hours, setHours] = useState(0)
    const [project, setProject] = useState("")
    const [typeOfWork, setTypeOfWork] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (isOpen && initialData) {
            setHours(initialData.hours || 0)
            setProject(initialData.projectName || "")
            // Assuming initialData might not have typeOfWork, or it sits in description etc.
            // For now we assume the data object passed in has these fields.
            // Adjust based on actual data structure if needed.
            setTypeOfWork(initialData.typeOfWork || "")
            setDescription(initialData.description || "")
        } else if (isOpen && !initialData) {
            // Reset for new entry
            setHours(0)
            setProject("")
            setTypeOfWork("")
            setDescription("")
        }
    }, [isOpen, initialData])

    const handleSave = () => {
        // Basic validation
        if (!project || !typeOfWork || !description) return;

        onSave({
            project,
            typeOfWork,
            description,
            hours,
            date
        })

        // Reset and close
        setHours(0)
        setProject("")
        setTypeOfWork("")
        setDescription("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-6 bg-white rounded-xl">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold text-gray-900">Add New Entry</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Project Select */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            Select Project * <Info className="h-4 w-4 text-gray-400" />
                        </Label>
                        <Select value={project} onValueChange={setProject}>
                            <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-lg text-gray-500">
                                <SelectValue placeholder="Project Name" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Project A">Project A</SelectItem>
                                <SelectItem value="Project B">Project B</SelectItem>
                                <SelectItem value="Internal">Internal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type of Work */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            Type of Work * <Info className="h-4 w-4 text-gray-400" />
                        </Label>
                        <Select value={typeOfWork} onValueChange={setTypeOfWork}>
                            <SelectTrigger className="w-full h-11 bg-white border-gray-200 rounded-lg text-gray-500">
                                <SelectValue placeholder="Bug fixes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bug fixes">Bug fixes</SelectItem>
                                <SelectItem value="Feature Development">Feature Development</SelectItem>
                                <SelectItem value="Meeting">Meeting</SelectItem>
                                <SelectItem value="Documentation">Documentation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Task Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Task description *</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write text here ..."
                            className="min-h-[120px] resize-none border-gray-200 rounded-lg p-3 text-sm focus:ring-blue-100"
                        />
                        <p className="text-xs text-gray-400">A note for extra info</p>
                    </div>

                    {/* Hours Counter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Hours *</Label>
                        <div className="flex items-center">
                            <button
                                onClick={() => setHours(Math.max(0, hours - 1))}
                                className="h-10 w-10 flex items-center justify-center border border-gray-200 bg-gray-50 rounded-l-md hover:bg-gray-100 text-gray-600"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="h-10 w-16 flex items-center justify-center border-t border-b border-gray-200 bg-white text-sm font-medium text-gray-900">
                                {hours}
                            </div>
                            <button
                                onClick={() => setHours(Math.min(24, hours + 1))}
                                className="h-10 w-10 flex items-center justify-center border border-gray-200 bg-gray-50 rounded-r-md hover:bg-gray-100 text-gray-600"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-8 flex gap-3 sm:justify-start">
                    <Button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 h-11 rounded-lg"
                        disabled={!project || !typeOfWork || !description}
                    >
                        {initialData ? "Save changes" : "Add entry"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-8 h-11 rounded-lg"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
