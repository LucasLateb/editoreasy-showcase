
import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationDotProps {
  className?: string;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ className }) => {
  return (
    <span
      className={cn(
        'block h-2.5 w-2.5 rounded-full bg-sky-500', // Utilisation de Sky Blue (proche de Ocean Blue #0EA5E9)
        className
      )}
      aria-hidden="true"
    />
  );
};

export default NotificationDot;
