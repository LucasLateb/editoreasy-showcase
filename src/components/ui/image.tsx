
import React, { useState, useEffect, useRef } from 'react';
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
    
    // Reset states when src changes
    useEffect(() => {
      setError(false);
      setLoaded(false);
      attemptedFallback.current = false;
      setImageSrc(src);
    }, [src]);
    
    // Fonction de gestion d'erreur pour l'image
    const handleError = () => {
      console.error(`Image loading failed: ${imageSrc}`);
      setError(true);
      
      if (!attemptedFallback.current) {
        attemptedFallback.current = true;
        if (imageSrc !== fallbackSrc) {
          console.log(`Trying fallback image: ${fallbackSrc}`);
          setImageSrc(fallbackSrc);
        }
      } else {
        // If fallback also fails, just set loaded to true to remove loading state
        setLoaded(true);
      }
    };

    // Fonction de gestion du chargement réussi
    const handleLoad = () => {
      console.log(`Image loaded successfully: ${imageSrc}`);
      setLoaded(true);
      setError(false);
    };
    
    // Add a cleanup to abort image loading when component unmounts
    useEffect(() => {
      return () => {
        if (imgRef.current) {
          imgRef.current.src = '';
        }
      };
    }, []);

    // Preload the image
    useEffect(() => {
      if (imageSrc) {
        const preloadImage = new window.Image();
        preloadImage.src = imageSrc;
        
        const handlePreloadSuccess = () => {
          // Image is now in browser cache
          console.log(`Preloaded image successfully: ${imageSrc}`);
        };
        
        const handlePreloadError = () => {
          console.error(`Failed to preload image: ${imageSrc}`);
          // Only attempt fallback if we haven't already and if we're not already using the fallback
          if (!attemptedFallback.current && imageSrc !== fallbackSrc) {
            attemptedFallback.current = true;
            setImageSrc(fallbackSrc);
          }
        };
        
        preloadImage.onload = handlePreloadSuccess;
        preloadImage.onerror = handlePreloadError;
        
        return () => {
          preloadImage.onload = null;
          preloadImage.onerror = null;
        };
      }
    }, [imageSrc, fallbackSrc]);
    
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        {!loaded && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        
        <img
          className={cn(
            'object-cover w-full h-full transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          src={imageSrc}
          alt={alt || "Image"}
          ref={(node) => {
            // This handles both the ref from forwardRef and our own ref
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
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
            Image unavailable
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
