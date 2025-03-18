
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading portfolio...",
  fullScreen = true
}) => {
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center" 
    : "py-12 flex items-center justify-center";
    
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
