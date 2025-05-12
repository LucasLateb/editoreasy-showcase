
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(src);
    const imgRef = useRef<HTMLImageElement>(null);
    const attemptedFallback = useRef(false);
    
    // Reset states when src changes but don't trigger unnecessary re-renders
    React.useEffect(() => {
      if (src !== imageSrc && !error) {
        setError(false);
        setLoaded(false);
        attemptedFallback.current = false;
        setImageSrc(src);
      }
    }, [src, imageSrc, error]);
    
    // Handle image loading error with simplified logic
    const handleError = () => {
      if (!attemptedFallback.current) {
        attemptedFallback.current = true;
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        } else {
          setLoaded(true);
        }
      } else {
        setLoaded(true);
      }
      setError(true);
    };

    const handleLoad = () => {
      setLoaded(true);
      setError(false);
    };
    
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        {!loaded && (
          <div className="absolute inset-0 bg-muted/30 animate-pulse" />
        )}
        
        <img
          className={cn(
            'object-cover w-full h-full transition-opacity duration-200',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          src={imageSrc}
          alt={alt || "Image"}
          ref={(node) => {
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            imgRef.current = node;
          }}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        
        {error && attemptedFallback.current && imageSrc === fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground text-xs">
            Image unavailable
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
