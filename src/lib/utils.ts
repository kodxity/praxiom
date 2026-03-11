import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format a duration (in milliseconds) into a human-readable string.
 * < 60 min  → "45m"
 * < 24 h    → "2h 30m" (or "3h" if no leftover minutes)
 * < 7 days  → "2d 4h" (or "3d")
 * < 5 weeks → "2w 3d" (or "3w")
 * otherwise → "3mo" / "2y"
 */
export function formatDuration(ms: number): string {
    const totalSecs = Math.round(ms / 1000);
    const mins  = Math.floor(totalSecs / 60);
    const hours = Math.floor(mins  / 60);
    const days  = Math.floor(hours / 24);
    const weeks = Math.floor(days  / 7);
    const months = Math.floor(days / 30);
    const years  = Math.floor(days / 365);

    if (days  >= 365) return years === 1  ? '1y'  : `${years}y`;
    if (days  >= 30)  return months === 1 ? '1mo' : `${months}mo`;
    if (hours >= 168) { // >= 7 days
        const remDays = days % 7;
        return remDays > 0 ? `${weeks}w ${remDays}d` : `${weeks}w`;
    }
    if (mins  >= 1440) { // >= 1 day
        const remHours = hours % 24;
        return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
    }
    if (mins  >= 60) {
        const remMins = mins % 60;
        return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
    }
    return `${mins}m`;
}

/**
 * Format a past date as a relative "time ago" string.
 */
export function timeAgo(date: Date | string): string {
    const diff   = Date.now() - new Date(date).getTime();
    const secs   = Math.floor(diff / 1000);
    const mins   = Math.floor(secs  / 60);
    const hours  = Math.floor(mins  / 60);
    const days   = Math.floor(hours / 24);
    const weeks  = Math.floor(days  / 7);
    const months = Math.floor(days  / 30);
    const years  = Math.floor(days  / 365);
    if (secs   < 60)  return `${secs}s ago`;
    if (mins   < 60)  return `${mins}m ago`;
    if (hours  < 24)  return `${hours}h ago`;
    if (days   < 7)   return `${days}d ago`;
    if (weeks  < 5)   return `${weeks}w ago`;
    if (months < 12)  return `${months}mo ago`;
    return `${years}y ago`;
}
