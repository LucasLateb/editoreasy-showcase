
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a utility function to ensure values are safe for use 
export function ensureArray<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
}

// Add safe rendering helper
export function safeRender<T>(
  isLoading: boolean, 
  data: T | null | undefined, 
  renderFn: (data: T) => React.ReactNode,
  fallback: React.ReactNode
): React.ReactNode {
  if (isLoading) {
    return fallback;
  }
  if (!data) {
    return fallback;
  }
  return renderFn(data);
}
