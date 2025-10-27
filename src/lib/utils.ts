export function formatLocalTime(timestamp: number): string {
    if (timestamp == 0) {
        return '';
    }
    const date: Date = new Date(timestamp);
    const hours: string = date.getHours().toString().padStart(2, '0'); // 补零使格式为两位数
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}
