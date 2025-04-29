import React, { useState } from 'react';
import { useVideoPreload } from '@/hooks/use-video-preload';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  preload?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  autoPlay = true,
  controls = true,
  preload = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { isLoaded, error } = useVideoPreload(src, preload);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative ${className}`}>
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-tech-dark/80">
          <Loader2 className="w-8 h-8 text-tech-blue animate-spin" />
          <span className="sr-only">Loading video...</span>
        </div>
      )}
      <video
        className="w-full aspect-video"
        controls={controls}
        autoPlay={autoPlay}
        onPlay={handlePlay}
        preload={preload ? 'auto' : 'metadata'}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;