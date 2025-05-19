
import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationDotProps {
  className?: string;
  count?: number;
  showCount?: boolean;
}

const NotificationDot: React.FC<NotificationDotProps> = ({ 
  className,
  count,
  showCount = false
}) => {
  if (showCount && count && count > 0) {
    return (
      <span
        className={cn(
          'flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-sky-500 text-white text-xs font-medium',
          className
        )}
        aria-label={`${count} unread notifications`}
      >
        {count > 99 ? '99+' : count}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'block h-2.5 w-2.5 rounded-full bg-sky-500',
        className
      )}
      aria-hidden="true"
    />
  );
};

export default NotificationDot;
