
import React from 'react';
import VideoCard from '@/components/VideoCard';
import { ExploreVideoType } from '@/hooks/useVideos';
import { Skeleton } from '@/components/ui/skeleton';

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
  // Show loading skeletons when data is loading
  if (isLoading) {
    return (
      <div className="min-h-[50vh] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg overflow-hidden">
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show "no videos" message when there are no videos to display
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 min-h-[50vh] flex flex-col items-center justify-center border border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground text-lg">No videos found.</p>
        <p className="text-muted-foreground">
          {selectedCategory ? 'Try selecting a different category.' : 'Check back later for new content.'}
        </p>
      </div>
    );
  }

  // Show the actual video grid when videos are available
  return (
    <div className="min-h-[50vh]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id} 
            onClick={() => onVideoClick(video)} 
            className="cursor-pointer transition-transform hover:scale-[1.02] duration-300"
          >
            <VideoCard video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
