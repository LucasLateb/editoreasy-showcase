import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined); // Initialize as undefined
    const imgRef = useRef<HTMLImageElement>(null);
    const attemptedFallback = useRef(false);
    
    useEffect(() => {
      setError(false);
      setLoaded(false);
      attemptedFallback.current = false;
      if (src && typeof src === 'string' && src.trim() !== '') {
        setImageSrc(src);
      } else {
        // If src is initially invalid or not provided, immediately use fallback
        console.log('Initial src is invalid or missing, attempting fallback directly:', fallbackSrc);
        setImageSrc(fallbackSrc);
        attemptedFallback.current = true; // We've directly chosen the fallback
      }
    }, [src, fallbackSrc]); // Added fallbackSrc to dependencies
    
    const handleError = () => {
      console.log('Image error occurred for src:', imageSrc); // Log current imageSrc being tried
      // Only try fallback if we haven't already and if current imageSrc is not already the fallback
      if (!attemptedFallback.current && imageSrc !== fallbackSrc) {
        attemptedFallback.current = true;
        console.log('Attempting to use fallback image:', fallbackSrc);
        setImageSrc(fallbackSrc);
        // Important: Reset loaded state if we're changing src to fallback, so onLoad can trigger for fallback
        setLoaded(false); 
      } else {
        // This means either we already tried fallback, or current src IS the fallback and it failed
        setLoaded(true); // Stop loading indicator
        setError(true);  // Show error state
        if (imageSrc === fallbackSrc) {
          console.log('Fallback image also failed to load:', fallbackSrc);
        } else {
          console.log('Error after already attempting fallback, or unknown error for:', imageSrc);
        }
      }
    };

    const handleLoad = () => {
      // Ensure this only triggers for the intended imageSrc
      // It might fire for old src if component re-renders quickly
      if (imgRef.current && imgRef.current.currentSrc === imageSrc) {
        console.log('Image loaded successfully:', imageSrc);
        setLoaded(true);
        setError(false);
      } else {
        console.log('handleLoad called but currentSrc does not match imageSrc. Current src:', imgRef.current?.currentSrc, 'Expected src:', imageSrc);
      }
    };
    
    useEffect(() => {
      const currentImgRef = imgRef.current;
      return () => {
        if (currentImgRef) {
          currentImgRef.src = ''; // Clear src on unmount to stop loading
        }
      };
    }, []); // No dependencies, run once on mount for cleanup function
    
    return (
      <div className={cn('relative w-full h-full overflow-hidden bg-muted/10', className)}>
        {/* Keep loading indicator visible if imageSrc is defined but not loaded */}
        {imageSrc && !loaded && !error && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        
        {imageSrc && ( // Only render img tag if imageSrc is defined
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
        
        {error && ( // Show error message if error state is true
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm p-2 text-center">
            Image indisponible
          </div>
        )}
        {!imageSrc && !fallbackSrc && ( // Case where no src and no fallback provided
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
