export function formatDuration(totalSeconds: number): string {
    const safeSeconds = Number.isFinite(totalSeconds) ? Math.floor(totalSeconds) : 0;
    const normalized = Math.max(0, safeSeconds);

    const hours = Math.floor(normalized / 3600);
    const minutes = Math.floor((normalized % 3600) / 60);
    const seconds = normalized % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}시간`);
    if (minutes > 0) parts.push(`${minutes}분`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}초`);

    return parts.join(' ');
}
