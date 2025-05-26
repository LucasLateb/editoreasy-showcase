
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [currentSrcProp, setCurrentSrcProp] = useState<string | undefined>(src); // To log the original src prop
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined); // Actual src for <img> tag
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const attemptedFallback = useRef(false);

    useEffect(() => {
      // This effect runs when `src` prop or `fallbackSrc` prop changes.
      console.log(`Image: useEffect triggered. Prop src: "${src}", Prop fallbackSrc: "${fallbackSrc}", Current imageSrc state: "${imageSrc}"`);
      
      attemptedFallback.current = false; // Reset fallback attempt state for new `src`
      setError(false); // Reset error state
      setLoaded(false); // Reset loaded state

      if (src && typeof src === 'string' && src.trim() !== '') {
        console.log(`Image: Using prop src: "${src}"`);
        setImageSrc(src);
      } else {
        console.log(`Image: Prop src ("${src}") is invalid or missing. Using fallbackSrc: "${fallbackSrc}"`);
        setImageSrc(fallbackSrc);
        // If we are already setting imageSrc to fallbackSrc, it means we've "attempted" it.
        attemptedFallback.current = true; 
      }
      setCurrentSrcProp(src); // Keep track of the original src prop for logging context
    }, [src, fallbackSrc]);

    const handleError = () => {
      // This handler is for the <img onError> event.
      // `imageSrc` at this point is the URL that failed.
      console.error(`Image: onError event for imageSrc: "${imageSrc}". Original prop src was: "${currentSrcProp}"`);

      if (!attemptedFallback.current && imageSrc !== fallbackSrc && fallbackSrc) {
        // Current `imageSrc` (which failed) was the original `src` (not the fallback).
        // And we haven't tried the fallback for *this original src* yet.
        // And fallbackSrc is actually provided.
        console.log(`Image: Attempting fallbackSrc: "${fallbackSrc}" because primary imageSrc ("${imageSrc}") failed.`);
        attemptedFallback.current = true;
        setImageSrc(fallbackSrc); 
        // Important: Reset loaded/error states for the fallback attempt.
        setLoaded(false); 
        setError(false);  
      } else {
        // Either:
        // 1. `imageSrc` (which failed) was already the `fallbackSrc`.
        // 2. Or, we had already tried the fallback (attemptedFallback.current is true).
        // 3. Or, no fallbackSrc is available.
        // In any of these cases, we don't try another fallback. Mark as definite error.
        console.error(`Image: FallbackSrc ("${fallbackSrc}") also failed or no other fallback to try for imageSrc ("${imageSrc}"). Marking as error.`);
        setError(true);
        setLoaded(true); // Consider loading 'finished' even if it's an error, to stop pulse animation and show error message.
      }
    };

    const handleLoad = () => {
      // This handler is for the <img onLoad> event.
      // `imageSrc` at this point is the URL that loaded.
      if (imgRef.current && imgRef.current.currentSrc === imageSrc) {
        console.log(`Image: onLoad event for imageSrc: "${imageSrc}". Original prop src was: "${currentSrcProp}"`);
        setLoaded(true);
        setError(false);
      } else {
        // This can happen if src prop changes quickly. An old image loaded after imageSrc state already points to a new URL.
        console.log(`Image: onLoad event for an outdated src. imgRef.current.currentSrc: "${imgRef.current?.currentSrc}", current imageSrc state: "${imageSrc}". Ignoring this load event.`);
      }
    };
    
    useEffect(() => {
      const currentImgRef = imgRef.current;
      // Cleanup function to prevent memory leaks or errors if component unmounts while loading
      return () => {
        if (currentImgRef) {
          // Detach handlers to prevent them from being called on an unmounted component
          currentImgRef.onload = null;
          currentImgRef.onerror = null;
          // Optionally, clear src to stop network request, though browser might handle this.
          // currentImgRef.src = ''; 
        }
      };
    }, []); // Run once on mount to set up cleanup for unmount

    // For debugging visibility:
    if (typeof imageSrc === 'string') { // Only log if imageSrc is a string to avoid "undefined" in logs too much
        console.log(`Image: Rendering. imageSrc: "${imageSrc}", loaded: ${loaded}, error: ${error}, opacity: ${loaded && !error ? 1 : 0}`);
    }


    return (
      <div className={cn('relative w-full h-full overflow-hidden bg-muted/10', className)}>
        {/* Keep loading indicator visible if imageSrc is defined but not loaded */}
        {imageSrc && !loaded && !error && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        
        {imageSrc && ( // Only render img tag if imageSrc is defined (could be original or fallback)
          <img
            key={imageSrc} // Adding a key helps React replace the img element if src changes, can help with event firing
            className={cn(
              'object-cover w-full h-full transition-opacity duration-300',
              loaded && !error ? 'opacity-100' : 'opacity-0' // Controls visibility based on load/error state
            )}
            src={imageSrc}
            alt={alt || "Image"}
            ref={(node) => {
              // Standard ref handling for forwardRef
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              imgRef.current = node; // Local ref for event handlers
            }}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
          />
        )}
        
        {/* Show error message if error state is true */}
        {error && ( 
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm p-2 text-center">
            Image indisponible
          </div>
        )}

        {/* Case: no src and no fallbackSrc was ever determined (should be rare with default fallback) */}
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
