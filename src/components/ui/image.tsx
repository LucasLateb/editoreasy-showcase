
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [imageSrc, setImageSrc] = useState<string | undefined>(src);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const attemptedFallback = useRef(false);

    // Reset state when src changes
    useEffect(() => {
      attemptedFallback.current = false;
      setError(false);
      setLoaded(false);
      
      if (src && typeof src === 'string' && src.trim() !== '') {
        setImageSrc(src);
      } else {
        setImageSrc(fallbackSrc);
        attemptedFallback.current = true;
      }
    }, [src, fallbackSrc]);

    const handleError = () => {
      if (!attemptedFallback.current && imageSrc !== fallbackSrc && fallbackSrc) {
        attemptedFallback.current = true;
        setImageSrc(fallbackSrc);
        setLoaded(false);
        setError(false);
      } else {
        setError(true);
        setLoaded(true);
      }
    };

    const handleLoad = () => {
      if (imgRef.current && imgRef.current.currentSrc) {
        setLoaded(true);
        setError(false);
      }
    };
    
    useEffect(() => {
      const currentImgRef = imgRef.current;
      return () => {
        if (currentImgRef) {
          currentImgRef.onload = null;
          currentImgRef.onerror = null;
        }
      };
    }, []);

    return (
      <div className={cn('relative w-full h-full overflow-hidden bg-muted/10', className)}>
        {imageSrc && !loaded && !error && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        
        {imageSrc && (
          <img
            className={cn(
              'object-cover w-full h-full transition-opacity duration-300',
              loaded && !error ? 'opacity-100' : 'opacity-0'
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
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm p-2 text-center">
            Image indisponible
          </div>
        )}

        {!imageSrc && !fallbackSrc && (
           <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm p-2 text-center">
            Aucune image
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
