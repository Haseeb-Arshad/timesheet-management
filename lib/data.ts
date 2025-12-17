export interface TimesheetSummary {
    id: number;
    week: number;
    dateRange: string;
    hours: number;
    status: string;
    action: string;
    startDate: Date;
    endDate: Date;
}

export interface DailyTask {
    id: string;
    date: Date;
    description: string;
    hours: number;
    projectName: string;
    typeOfWork?: string;
}

export interface TimesheetDetails extends TimesheetSummary {
    tasks: DailyTask[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TimesheetParams {
    page?: number;
    limit?: number;
    status?: string | null;
    dateStart?: string | null;
    dateEnd?: string | null;
    sortField?: string | null;
    sortOrder?: 'asc' | 'desc';
    token?: string; // Auth token
}

// Deterministic random number generator for consistency
function mulberry32(a: number) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function getTimesheet(id: number): TimesheetSummary | null {
    const seed = id * 12345;
    const rand = mulberry32(seed);

    const week = Math.ceil(id / 5);
    // Simple logic to map ID to a date in 2024
    const start = new Date(2024, 0, 1 + (id * 7)); // This logic might drift but is fine for mocks
    const end = new Date(start);
    end.setDate(start.getDate() + 4);

    const dateRange = `${start.getDate()} ${start.toLocaleString('default', { month: 'long' })} - ${end.getDate()} ${end.toLocaleString('default', { month: 'long' })}, ${end.getFullYear()} `;

    let hours = 0;
    const r = rand();
    if (r > 0.66) hours = 40;
    else if (r > 0.33) hours = Math.floor(rand() * 39) + 1;
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
        hours,
        status,
        action,
        startDate: start,
        endDate: end
    };
}

export async function getTimesheetDetails(id: number, token?: string): Promise<TimesheetDetails | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // To implement real API:
    // const res = await fetch(`https://api.example.com/timesheets/${id}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // })
    // return res.json()

    const summary = getTimesheet(id);
    if (!summary) return null;

    const tasks: DailyTask[] = [];
    const seed = id * 54321;
    const rand = mulberry32(seed);

    // Generate tasks for each day (Mon-Fri)
    for (let i = 0; i < 5; i++) {
        const date = new Date(summary.startDate);
        date.setDate(date.getDate() + i);

        // Random number of tasks per day (0-3)
        const numTasks = Math.floor(rand() * 4);

        for (let j = 0; j < numTasks; j++) {
            tasks.push({
                id: `${id}-${i}-${j}`,
                date: new Date(date), // Copy date
                description: "Homepage Development", // Placeholder as in design
                hours: 4, // Placeholder
                projectName: "Project Name",
                typeOfWork: "Feature Development"
            });
        }
    }

    return {
        ...summary,
        tasks,
        hours: tasks.reduce((sum, t) => sum + t.hours, 0),
        status: tasks.reduce((sum, t) => sum + t.hours, 0) >= 40 ? "completed" : tasks.reduce((sum, t) => sum + t.hours, 0) > 0 ? "incomplete" : "missing"
    };
}

export async function getAllTimesheets(params?: TimesheetParams): Promise<PaginatedResponse<TimesheetSummary>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // To implement real API:
    // const query = new URLSearchParams(params as any).toString();
    // const res = await fetch(`https://api.example.com/timesheets?${query}`, {
    //   headers: { Authorization: `Bearer ${params?.token}` }
    // })
    // return res.json()

    let allData = Array.from({ length: 200 }).map((_, i) => {
        const id = i + 1;
        const summary = getTimesheet(id);
        if (!summary) throw new Error("Failed to generate timesheet");
        return summary;
    });

    // 1. Filter
    if (params?.status && params.status !== "all") {
        allData = allData.filter(t => t.status === params.status);
    }
    if (params?.dateStart && params?.dateEnd) {
        const start = new Date(params.dateStart);
        const end = new Date(params.dateEnd);
        allData = allData.filter(t => t.startDate <= end && t.endDate >= start);
    }

    // 2. Sort
    if (params?.sortField) {
        const field = params.sortField as keyof TimesheetSummary;
        const order = params.sortOrder || 'asc';

        allData.sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];

            if (field === 'dateRange') {
                aVal = a.startDate.getTime();
                bVal = b.startDate.getTime();
            }

            if (aVal === bVal) return 0;
            const res = aVal > bVal ? 1 : -1;
            return order === 'asc' ? res : -res;
        });
    }

    // 3. Paginate
    const page = params?.page || 1;
    const limit = params?.limit || 5;
    const total = allData.length;
    const totalPages = Math.ceil(total / limit);
    const startIdx = (page - 1) * limit;

    // Safety check
    if (startIdx >= total && page > 1) {
        return {
            data: [],
            total,
            page,
            limit,
            totalPages
        }
    }

    const paginatedData = allData.slice(startIdx, startIdx + limit);

    return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages
    };
}
