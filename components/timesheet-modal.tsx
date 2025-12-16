"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const timesheetSchema = z.object({
    week: z.coerce.number().min(1, "Week is required"),
    dateRange: z.string().min(1, "Date range is required"),
    hours: z.coerce.number().min(0, "Hours cannot be negative").max(168, "Max hours exceeded"),
})

type TimesheetFormValues = z.infer<typeof timesheetSchema>

interface TimesheetModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: TimesheetFormValues & { status: string }) => void
    initialData?: TimesheetFormValues
    mode: "create" | "update" | "view"
}

export function TimesheetModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode,
}: TimesheetModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<TimesheetFormValues>({
        resolver: zodResolver(timesheetSchema),
        defaultValues: {
            week: undefined,
            dateRange: "",
            hours: 0,
        },
    })

    // Watch hours to derive status for display
    const hours = watch("hours");
    let calculatedStatus = "missing";
    if (hours === 0) calculatedStatus = "missing";
    else if (hours >= 40) calculatedStatus = "completed";
    else calculatedStatus = "incomplete";

    useEffect(() => {
        if (initialData) {
            reset({
                week: initialData.week,
                dateRange: initialData.dateRange,
                hours: initialData.hours || 0
            })
        } else {
            reset({
                week: undefined,
                dateRange: "",
                hours: 0,
            })
        }
    }, [initialData, reset, isOpen])

    const handleFormSubmit = (data: TimesheetFormValues) => {
        let status = "missing";
        if (data.hours === 0) status = "missing";
        else if (data.hours >= 40) status = "completed";
        else status = "incomplete";

        onSubmit({ ...data, status })
        onClose()
    }

    const isView = mode === "view"

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create"
                            ? "Create Timesheet"
                            : mode === "update"
                                ? "Update Timesheet"
                                : "View Timesheet"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "view"
                            ? "Details of the timesheet."
                            : "Enter the details for the timesheet below."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="week" className="text-right">
                            Week #
                        </Label>
                        <Input
                            id="week"
                            type="number"
                            className="col-span-3"
                            disabled={isView}
                            {...register("week")}
                        />
                        {errors.week && (
                            <p className="col-span-4 text-right text-xs text-red-500">{errors.week.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right text-gray-700">
                            Start Date
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            className="col-span-3 h-10 rounded-lg border-gray-200"
                            disabled={isView}
                            {...register("dateRange")}
                        />
                        {errors.dateRange && (
                            <p className="col-span-4 text-right text-xs text-red-500">{errors.dateRange.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right text-gray-700">
                            End Date
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            className="col-span-3 h-10 rounded-lg border-gray-200"
                            disabled={isView}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hours" className="text-right">
                            Hours
                        </Label>
                        <Input
                            id="hours"
                            type="number"
                            className="col-span-3"
                            disabled={isView}
                            {...register("hours")}
                        />
                        {errors.hours && (
                            <p className="col-span-4 text-right text-xs text-red-500">{errors.hours.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <div className="col-span-3">
                            <span className="text-sm font-medium capitalize text-gray-700">
                                {calculatedStatus}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        {!isView && <Button type="submit">Save changes</Button>}
                        {isView && <Button type="button" onClick={onClose}>Close</Button>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

