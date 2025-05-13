
import React from 'react';
import VideoCard from '@/components/VideoCard';
import { ExploreVideoType } from '@/hooks/useVideos';

interface VideoGridProps {
  videos: ExploreVideoType[];
  isLoading: boolean;
  onVideoClick: (video: ExploreVideoType) => void;
  selectedCategory?: string | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  isLoading,
  onVideoClick,
  selectedCategory
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found. {selectedCategory ? 'Try selecting a different category.' : ''}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <div key={video.id} onClick={() => onVideoClick(video)}>
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
