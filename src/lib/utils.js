import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names with Tailwind CSS classes properly merged
 * Uses clsx for conditional logic and tailwind-merge to handle conflicting classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}