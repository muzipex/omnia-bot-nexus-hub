
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to format numbers with K, M, B suffixes
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toString();
  }
}

// Helper to determine if we're on the client side
export const isClient = typeof window !== 'undefined';

// Reports web vitals
export function reportWebVitals(): void {
  if (isClient && 'performance' in window && 'getEntriesByType' in performance) {
    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0 && 'loadEventEnd' in entries[0]) {
        const loadTime = (entries[0] as any).loadEventEnd;
        console.log(`Page loaded in: ${loadTime.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('Error reporting web vitals:', error);
    }
  }
}

// Add scrollToSection function
export function scrollToSection(sectionId: string): void {
  if (isClient) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Preload components to improve performance
export function preloadComponents(): void {
  if (isClient) {
    // Preload key routes
    const preloadRoutes = ['/models', '/success'];
    preloadRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
}

// Format currency with symbol
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

// Create a debounced function
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Generate random ID for temporary elements
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
