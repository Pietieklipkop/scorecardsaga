import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score < 0) return "00.00";
  const seconds = Math.floor(score / 100);
  const hundredths = score % 100;

  const paddedSeconds = String(seconds).padStart(2, '0');
  const paddedHundredths = String(hundredths).padStart(2, '0');
  
  return `${paddedSeconds}.${paddedHundredths}`;
}

export function timeStringToHundredths(timeString: string): number {
  if (!timeString || timeString.length === 0) return 0;
  const paddedVal = timeString.padStart(4, '0');
  const seconds = parseInt(paddedVal.substring(0, 2), 10);
  const hundredths = parseInt(paddedVal.substring(2, 4), 10);
  return (seconds * 100) + hundredths;
}
