import { useState, useEffect } from 'react';

export const useVideoPreload = (videoUrl: string, shouldPreload: boolean = false) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shouldPreload) return;

    const video = document.createElement('video');
    video.preload = 'metadata';

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setError(new Error('Failed to preload video'));
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);

    video.src = videoUrl;

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.src = '';
    };
  }, [videoUrl, shouldPreload]);

  return { isLoaded, error };
};