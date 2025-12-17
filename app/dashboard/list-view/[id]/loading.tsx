import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen">
            <main className="max-w-[1200px] mx-auto px-6 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-4 w-24 ml-auto rounded" />
                            <Skeleton className="h-2 w-32 ml-auto rounded" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-20 rounded" />
                                <Skeleton className="h-10 w-full rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
