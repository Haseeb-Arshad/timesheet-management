import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-8 w-48 bg-gray-100 rounded mb-6 animate-pulse" />
                    <div className="flex gap-3 mb-6">
                        <Skeleton className="h-[36px] w-[140px] rounded-lg" />
                        <Skeleton className="h-[36px] w-[120px] rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full rounded-lg" />
                        <Skeleton className="h-48 w-full rounded-lg" />
                    </div>
                </div>
            </main>
        </div>
    )
}
