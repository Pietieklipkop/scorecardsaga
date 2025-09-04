import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score < 0) return "00:00";
  const minutes = Math.floor(score / 60);
  const seconds = score % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
}

export function timeStringToSeconds(timeString: string): number {
  const paddedVal = timeString.padStart(4, '0');
  const minutes = parseInt(paddedVal.substring(0, 2), 10);
  const seconds = parseInt(paddedVal.substring(2, 4), 10);
  return (minutes * 60) + seconds;
}
