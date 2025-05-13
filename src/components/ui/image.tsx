
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
    const timestamp = useRef(Date.now());
    
    // Reset states when src changes
    useEffect(() => {
      setError(false);
      setLoaded(false);
      attemptedFallback.current = false;
      
      // Add timestamp to prevent caching issues with Supabase Storage
      if (src && typeof src === 'string' && src.includes('supabase.co')) {
        // Add or update timestamp parameter to bust cache
        timestamp.current = Date.now();
        const urlWithTimestamp = src.includes('?') 
          ? `${src}&t=${timestamp.current}`
          : `${src}?t=${timestamp.current}`;
        setImageSrc(urlWithTimestamp);
      } else {
        setImageSrc(src);
      }
    }, [src]);
    
    // Handle image loading error
    const handleError = () => {
      console.log('Image error occurred for src:', imageSrc);
      if (!attemptedFallback.current) {
        attemptedFallback.current = true;
        console.log('Attempting to use fallback image:', fallbackSrc);
        // Only change the src if it's different from the fallback
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        } else {
          // If we're already using the fallback, just set loaded
          setLoaded(true);
          setError(true);
          console.log('Already using fallback, marking as loaded with error');
        }
      } else {
        // If fallback also fails, just set loaded to true to remove loading state
        setLoaded(true);
        setError(true);
        console.log('Fallback image also failed to load');
      }
    };

    // Handle successful image load
    const handleLoad = () => {
      console.log('Image loaded successfully:', imageSrc);
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
        
        {error && (
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
