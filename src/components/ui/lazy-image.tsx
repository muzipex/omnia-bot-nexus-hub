import React from 'react';
import { useLazyLoad } from '@/hooks/use-lazy-load';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  blurHash?: string;
  aspectRatio?: string;
}

const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ className, src, alt, blurHash, aspectRatio = '16/9', ...props }, ref) => {
    const { elementRef, isVisible } = useLazyLoad();

    return (
      <div 
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'relative overflow-hidden bg-tech-charcoal/30',
          className
        )}
        style={{ aspectRatio }}
      >
        {isVisible ? (
          <img
            ref={ref}
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            {...props}
          />
        ) : (
          <div 
            className="absolute inset-0 bg-tech-charcoal/30 animate-pulse"
            aria-label={`Loading ${alt}`}
          />
        )}
      </div>
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;