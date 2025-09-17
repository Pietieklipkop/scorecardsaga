import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score < 0) return "00:00:00";
  const totalSeconds = Math.floor(score / 100);
  const hundredths = score % 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  const paddedHundredths = String(hundredths).padStart(2, '0');
  
  return `${paddedMinutes}:${paddedSeconds}:${paddedHundredths}`;
}

export function timeStringToHundredths(timeString: string): number {
  const paddedVal = timeString.padStart(6, '0');
  const minutes = parseInt(paddedVal.substring(0, 2), 10);
  const seconds = parseInt(paddedVal.substring(2, 4), 10);
  const hundredths = parseInt(paddedVal.substring(4, 6), 10);
  return (minutes * 60 * 100) + (seconds * 100) + hundredths;
}
