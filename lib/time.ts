import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDateTime(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return format(new Date(value), "dd MMM yyyy, HH:mm:ss");
}

export function formatRelativeTime(value: string) {
  return `${formatDistanceToNowStrict(new Date(value))} ago`;
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return "In progress";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
