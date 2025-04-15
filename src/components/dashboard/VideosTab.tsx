
import React from 'react';
import { Video, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Film } from 'lucide-react';
import VideoCardDashboard from '@/components/VideoCardDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideosTabProps {
  videos: Video[];
  categories: Category[];
  isLoading: boolean;
  onUploadClick: () => void;
  onDeleteClick: (videoId: string) => void;
}

const VideosTab: React.FC<VideosTabProps> = ({
  videos,
  categories,
  isLoading,
  onUploadClick,
  onDeleteClick
}) => {
  const handleEditVideo = async (videoId: string, updatedVideo: Partial<Video>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: updatedVideo.title,
          description: updatedVideo.description,
          category_id: updatedVideo.categoryId,
          video_url: updatedVideo.videoUrl,
          thumbnail_url: updatedVideo.thumbnailUrl,
        })
        .eq('id', videoId);

      if (error) throw error;

      // Show success message
      toast.success('Video updated successfully');
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    }
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        const category = categories.find(c => c.id === video.categoryId);
        
        return (
          <VideoCardDashboard 
            key={video.id}
            video={video}
            category={category}
            onDelete={onDeleteClick}
            onEdit={handleEditVideo}
          />
        );
      })}
    </div>
  );
};

export default VideosTab;
