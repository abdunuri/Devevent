import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEventDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const looksDateLike = /^\d{4}-\d{2}-\d{2}/.test(trimmed);
  if (!looksDateLike) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return trimmed;
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatEventTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const hasAmPm = /\b(am|pm)\b/i.test(trimmed);
  if (hasAmPm) {
    return trimmed;
  }

  const hhmmMatch = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (hhmmMatch) {
    const date = new Date();
    date.setHours(Number.parseInt(hhmmMatch[1], 10), Number.parseInt(hhmmMatch[2], 10), 0, 0);
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return trimmed;
}
