import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const scrollToSection = (elementId: string) => {
  const element = document.getElementById(elementId);
  const headerOffset = 80; // Height of fixed header + some padding
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    // Update aria-current for navigation
    document.querySelectorAll('[aria-current]').forEach(el => el.removeAttribute('aria-current'));
    document.querySelector(`a[href="#${elementId}"]`)?.setAttribute('aria-current', 'true');
  }
};

export const reportWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const value = entry.value;
        const name = entry.name;
        const id = entry.id;

        // Send to analytics
        console.log(`Web Vital: ${name}`, {
          value,
          id,
          rating: value <= getCLSThreshold(name) ? 'good' : 'poor'
        });
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
};

const getCLSThreshold = (metricName: string): number => {
  switch (metricName) {
    case 'CLS':
      return 0.1; // Good CLS threshold
    case 'LCP':
      return 2500; // Good LCP threshold (ms)
    case 'FID':
      return 100; // Good FID threshold (ms)
    default:
      return 0;
  }
};

export const preloadRouteComponent = (path: string) => {
  // Mapping of routes to their component paths
  const routeComponentMap: Record<string, () => Promise<any>> = {
    '/': () => import('../pages/Index'),
    '/success': () => import('../pages/Success'),
    '/404': () => import('../pages/NotFound'),
  };

  const importComponent = routeComponentMap[path];
  if (importComponent) {
    // Trigger the import but don't wait for it
    importComponent();
  }
};

export const preloadComponents = () => {
  // Use requestIdleCallback for better performance
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Preload components based on viewport visibility
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const href = entry.target.getAttribute('href');
            if (href) {
              preloadRouteComponent(href);
            }
          }
        });
      });

      // Observe all navigation links
      document.querySelectorAll('a[href^="/"]').forEach(link => {
        observer.observe(link);
      });
    });
  }
};
