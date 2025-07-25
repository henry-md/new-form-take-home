import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCadence = (cadence: string) => {
  switch (cadence) {
    case 'manual': return 'Manual';
    case 'hourly': return 'Every Hour';
    case 'every12h': return 'Every 12 Hours';
    case 'daily': return 'Daily';
    default: return cadence;
  }
};
