import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple CSS class names and resolves Tailwind CSS class conflicts.
 *
 * @param inputs - Array of conditional class values (strings, objects, arrays, etc.)
 * @returns Optimized merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

