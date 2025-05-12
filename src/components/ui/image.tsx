
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);
    
    // Fonction de gestion d'erreur pour l'image
    const handleError = () => {
      console.log(`Image loading failed: ${src}`);
      setError(true);
      setLoaded(true); // Set loaded to true so we display the fallback
    };

    // Fonction de gestion du chargement réussi
    const handleLoad = () => {
      console.log(`Image loaded successfully: ${src}`);
      setLoaded(true);
    };
    
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        {!loaded && (
          <div className="absolute inset-0 bg-muted/50 animate-pulse" />
        )}
        
        {/* Image principale ou l'image de fallback si erreur */}
        <img
          className={cn(
            'object-cover w-full h-full transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          src={error ? fallbackSrc : src}
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
