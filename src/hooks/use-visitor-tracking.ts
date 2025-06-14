
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitorTracking = () => {
  const sessionId = useRef<string>();
  const startTime = useRef<number>();

  useEffect(() => {
    // Generate unique session ID
    sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    startTime.current = Date.now();

    const trackVisitor = async () => {
      try {
        // Get user's location info (simplified - in production you'd use a geolocation service)
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;
        const currentPath = window.location.pathname;

        // Insert visitor session
        await supabase
          .from('visitor_sessions')
          .insert({
            session_id: sessionId.current,
            page_path: currentPath,
            referrer,
            user_agent: userAgent,
            country: 'Unknown', // In production, use IP geolocation
            city: 'Unknown',
            ip_address: null // Would be populated server-side
          });

        // Track page view
        await supabase
          .from('page_views')
          .insert({
            session_id: sessionId.current,
            page_path: currentPath,
            referrer
          });

      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    trackVisitor();

    // Track page changes
    const handlePageChange = async (newPath: string) => {
      try {
        if (startTime.current) {
          const duration = Math.floor((Date.now() - startTime.current) / 1000);
          
          // Update previous page duration
          await supabase
            .from('page_views')
            .update({ duration_seconds: duration })
            .eq('session_id', sessionId.current)
            .order('created_at', { ascending: false })
            .limit(1);
        }

        // Track new page view
        await supabase
          .from('page_views')
          .insert({
            session_id: sessionId.current,
            page_path: newPath,
            referrer: window.location.pathname
          });

        startTime.current = Date.now();
      } catch (error) {
        console.error('Error tracking page change:', error);
      }
    };

    // Listen for route changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handlePageChange(window.location.pathname);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handlePageChange(window.location.pathname);
    };

    window.addEventListener('popstate', () => {
      handlePageChange(window.location.pathname);
    });

    // Update session as active periodically
    const updateInterval = setInterval(async () => {
      try {
        await supabase
          .from('visitor_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('session_id', sessionId.current);
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }, 30000); // Update every 30 seconds

    // Cleanup on page unload
    const handleBeforeUnload = async () => {
      if (startTime.current) {
        const duration = Math.floor((Date.now() - startTime.current) / 1000);
        
        try {
          await supabase
            .from('page_views')
            .update({ duration_seconds: duration })
            .eq('session_id', sessionId.current)
            .order('created_at', { ascending: false })
            .limit(1);

          await supabase
            .from('visitor_sessions')
            .update({ is_active: false })
            .eq('session_id', sessionId.current);
        } catch (error) {
          console.error('Error on cleanup:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', () => handlePageChange(window.location.pathname));
      
      // Restore original methods
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  const trackPageView = async (path: string) => {
    try {
      console.log('Tracking page view:', path);
      await supabase
        .from('page_views')
        .insert({
          session_id: sessionId.current,
          page_path: path,
          referrer: document.referrer || null
        });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  return { 
    sessionId: sessionId.current || '',
    trackPageView
  };
};
