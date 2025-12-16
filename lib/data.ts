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
}

export interface TimesheetDetails extends TimesheetSummary {
    tasks: DailyTask[];
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

export function getTimesheetDetails(id: number): TimesheetDetails | null {
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
                projectName: "Project Name"
            });
        }
    }

    return {
        ...summary,
        tasks
    };
}
