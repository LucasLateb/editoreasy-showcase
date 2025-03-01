
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading portfolio settings...</p>
      </div>
    </div>
  );
};

export default LoadingState;
