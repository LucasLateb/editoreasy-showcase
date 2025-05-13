
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
  if (isLoading) {
    return (
      <div className="min-h-[50vh]">
        <VideoSkeletons />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-[50vh]">
        <EmptyState selectedCategory={selectedCategory} onClearCategory={onClearCategory} />
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      "min-h-[50vh]"
    )}>
      {videos.map((video) => (
        <div key={video.id} onClick={() => onVideoClick(video)}>
          <VideoCard video={video as Video} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
