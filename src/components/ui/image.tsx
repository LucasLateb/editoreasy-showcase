
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, src, alt, fallbackSrc = '/placeholder.svg', ...props }, ref) => {
    const [error, setError] = useState(false);
    
    return (
      <img
        className={cn('object-cover w-full h-full', className)}
        src={error ? fallbackSrc : src}
        alt={alt || "Image"}
        ref={ref}
        onError={(e) => {
          console.log(`Failed to load image: ${src}`);
          setError(true);
        }}
        {...props}
      />
    );
  }
);

Image.displayName = 'Image';

export { Image };
