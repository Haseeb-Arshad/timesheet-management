"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Failed to load timesheet details.</h2>
                <p className="text-gray-500">Please try again later.</p>
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        </div>
    )
}
