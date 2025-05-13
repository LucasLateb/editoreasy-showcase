
import React from 'react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoSkeletons } from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/explore/EmptyState';
import { ExploreVideoType } from '@/hooks/useExploreData';
import { cn } from '@/lib/utils';

interface VideoGridProps {
  videos: ExploreVideoType[];
  isLoading: boolean;
  selectedCategory: any;
  onClearCategory: () => void;
  onVideoClick: (video: ExploreVideoType) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  isLoading,
  selectedCategory,
  onClearCategory,
  onVideoClick,
}) => {
  // Using consistent container height for all states to prevent layout shifts
  const containerClasses = "min-h-[50vh]";
  
  if (isLoading) {
    return (
      <div className={containerClasses}>
        <VideoSkeletons />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={containerClasses}>
        <EmptyState selectedCategory={selectedCategory} onClearCategory={onClearCategory} />
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      containerClasses
    )}>
      {videos.map((video) => (
        <div key={video.id} onClick={() => onVideoClick(video)} className="cursor-pointer">
          <VideoCard video={video as Video} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
