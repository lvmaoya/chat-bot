export function formatLocalTime(timestamp: number): string {
    if (timestamp == 0) {
        return '';
    }
    const date: Date = new Date(timestamp);
    const hours: string = date.getHours().toString().padStart(2, '0');
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    // 如果不是今天，添加日期
    const now = new Date();
    const isSameDay =
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate();

    if (isSameDay) {
        return `${hours}:${minutes}`;
    }

    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d} ${hours}:${minutes}`;
}
