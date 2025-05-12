
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | undefined>(src);
    
    // Reset states when src changes
    useEffect(() => {
      setError(false);
      setLoaded(false);
      setImageSrc(src);
    }, [src]);
    
    // Fonction de gestion d'erreur pour l'image
    const handleError = () => {
      console.log(`Image loading failed: ${imageSrc}`);
      setError(true);
      setLoaded(true);
      if (imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    };

    // Fonction de gestion du chargement réussi
    const handleLoad = () => {
      console.log(`Image loaded successfully: ${imageSrc}`);
      setLoaded(true);
    };
    
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
          ref={ref}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
