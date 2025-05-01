import { useEffect } from 'react';
import { PageVisit } from '@/types/admin';

let visits: PageVisit[] = [];

// Load from localStorage on module initialization
const storedVisits = localStorage.getItem('page_visits');
if (storedVisits) {
  visits = JSON.parse(storedVisits);
}

export const trackPageVisit = () => {
  const visit: PageVisit = {
    id: Math.random().toString(36).substring(2, 15),
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer || undefined
  };

  visits.push(visit);

  // Keep only last 1000 visits to prevent localStorage from getting too large
  if (visits.length > 1000) {
    visits = visits.slice(-1000);
  }

  localStorage.setItem('page_visits', JSON.stringify(visits));
};

export const getVisits = () => {
  return visits;
};

export const useVisitorTracking = () => {
  useEffect(() => {
    trackPageVisit();
  }, []);

  return null;
};