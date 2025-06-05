
import React from 'react';
import { Video } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Film } from 'lucide-react';
import VideoCardDashboard from './VideoCardDashboard';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';
import { getVideoAspectRatio } from '@/utils/videoHelpers';

interface VideosTabProps {
  videos: Video[];
  isLoading: boolean;
  onUploadClick: () => void;
  onDeleteClick: (videoId: string) => void;
}

const VideosTab: React.FC<VideosTabProps> = ({
  videos,
  isLoading,
  onUploadClick,
  onDeleteClick
}) => {
  // Use the fallback hook instead of the regular one for consistency
  const { categories } = useCategoriesWithFallback();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-6">Upload your first video to start building your portfolio</p>
          <Button onClick={onUploadClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group videos by aspect ratio
  const verticalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'vertical');
  const horizontalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'horizontal');

  return (
    <div className="flex gap-6">
      {/* Left side: Horizontal videos in grid */}
      <div className="flex-1">
        {horizontalVideos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {horizontalVideos.map((video) => {
              const category = categories.find(c => c.id === video.categoryId);
              
              return (
                <VideoCardDashboard 
                  key={video.id}
                  video={video}
                  category={category}
                  onDelete={onDeleteClick}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Right side: Vertical videos in single column */}
      {verticalVideos.length > 0 && (
        <div className="w-[300px] flex-shrink-0">
          <div className="space-y-4">
            {verticalVideos.map((video) => {
              const category = categories.find(c => c.id === video.categoryId);
              
              return (
                <VideoCardDashboard 
                  key={video.id}
                  video={video}
                  category={category}
                  onDelete={onDeleteClick}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosTab;
