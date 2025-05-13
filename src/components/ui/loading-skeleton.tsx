
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoSkeletonsProps {
  count?: number;
}

export const VideoSkeletons: React.FC<VideoSkeletonsProps> = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[180px] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);
