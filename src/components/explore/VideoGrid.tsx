
import React from 'react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { VideoSkeletons } from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/explore/EmptyState';
import { ExploreVideoType } from '@/hooks/useExploreData';

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
    return <VideoSkeletons />;
  }

  if (videos.length === 0) {
    return <EmptyState selectedCategory={selectedCategory} onClearCategory={onClearCategory} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div key={video.id} onClick={() => onVideoClick(video)}>
          <VideoCard video={video as Video} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
