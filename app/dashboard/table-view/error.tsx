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
        // Log to monitoring service in production
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Something went wrong!</h2>
                <p className="text-gray-500">We couldn't load the timesheets. Please try again.</p>
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        variant="outline"
                    >
                        Try again
                    </Button>
                    <Button
                        onClick={() => window.location.reload()}
                    >
                        Reload Page
                    </Button>
                </div>
            </div>
        </div>
    )
}
