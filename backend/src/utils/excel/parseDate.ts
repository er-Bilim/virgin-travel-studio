export function parseDate(value: unknown): Date | null {
    if (typeof value !== 'string') return null;

    const date = new Date(value);
    if (isNaN(date.getTime())) return null;

    return date;
}