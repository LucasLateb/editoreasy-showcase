
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        {!loaded && !error && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        <img
          className={cn(
            'object-cover w-full h-full transition-opacity',
            loaded && !error ? 'opacity-100' : 'opacity-0'
          )}
          src={error ? fallbackSrc : src}
          alt={alt || "Image"}
          ref={ref}
          onError={() => {
            console.log(`Failed to load image: ${src}`);
            setError(true);
          }}
          onLoad={() => setLoaded(true)}
          {...props}
        />
        {error && (
          <img
            src={fallbackSrc}
            alt="Fallback"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
