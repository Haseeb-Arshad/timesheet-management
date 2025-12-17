"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationCustomProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationCustom({ currentPage, totalPages, onPageChange }: PaginationCustomProps) {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 7; // Max buttons to show including ellipsis

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex logic for ellipsis
            // Always show 1
            pages.push(1);

            if (currentPage > 4) {
                pages.push('...');
            }

            // Show range around current
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // Adjustment for start/end to keep count consistent
            if (currentPage <= 4) {
                start = 2;
                end = 5;
            } else if (currentPage >= totalPages - 3) {
                start = totalPages - 4;
                end = totalPages - 1;
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 3) {
                pages.push('...');
            }

            // Always show last
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex w-full max-w-[487px] h-[36px] rounded-md shadow-sm" aria-label="Pagination">
            <Button
                variant="ghost"
                className="flex-1 min-w-0 relative inline-flex items-center justify-center h-full px-3 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white border border-[#E5E7EB] rounded-l-md rounded-r-none hover:bg-gray-50 focus:z-10 disabled:opacity-50"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </Button>

            {getPageNumbers().map((page, idx) => (
                typeof page === 'number' ? (
                    <Button
                        key={idx}
                        variant="ghost"
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "relative inline-flex items-center justify-center w-[36px] h-full -ml-px text-sm font-medium border border-[#E5E7EB] rounded-none focus:z-20",
                            currentPage === page
                                ? "bg-[#F9FAFB] text-[#1447E6]" // Active state
                                : "bg-white text-gray-700 hover:bg-gray-50" // Inactive
                        )}
                    >
                        {page}
                    </Button>
                ) : (
                    <span key={idx} className="relative inline-flex items-center justify-center w-[36px] h-full -ml-px text-gray-400 text-sm bg-white border border-[#E5E7EB]">
                        ...
                    </span>
                )
            ))}

            <Button
                variant="ghost"
                className="flex-1 min-w-0 relative inline-flex items-center justify-center h-full -ml-px px-3 text-sm font-medium text-gray-500 hover:text-gray-900 bg-white border border-[#E5E7EB] rounded-r-md rounded-l-none hover:bg-gray-50 focus:z-10 disabled:opacity-50"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </Button>
        </div>
    )
}
