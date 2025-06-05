
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

  // Group videos by aspect ratio for the new 3-column layout
  const verticalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'vertical');
  const horizontalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'horizontal');
  
  // Create rows with 2 horizontal + 1 vertical videos
  const rows = [];
  let horizontalIndex = 0;
  let verticalIndex = 0;
  
  while (horizontalIndex < horizontalVideos.length || verticalIndex < verticalVideos.length) {
    const row = {
      horizontal: horizontalVideos.slice(horizontalIndex, horizontalIndex + 4), // 4 horizontal videos (2 rows of 2)
      vertical: verticalVideos[verticalIndex] || null
    };
    
    rows.push(row);
    horizontalIndex += 4;
    verticalIndex += 1;
  }

  return (
    <div className="space-y-6">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-4 h-[400px]">
          {/* Left column: 2x2 grid of horizontal videos */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              {row.horizontal.map((video) => {
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
          
          {/* Right column: 1 vertical video spanning full height */}
          <div className="col-span-1">
            {row.vertical && (
              <div className="h-full">
                {(() => {
                  const category = categories.find(c => c.id === row.vertical.categoryId);
                  
                  return (
                    <VideoCardDashboard 
                      video={row.vertical}
                      category={category}
                      onDelete={onDeleteClick}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosTab;
