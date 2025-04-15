
import React, { useState } from 'react';
import { Video, categories } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Heart } from 'lucide-react';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import VideoEditDialog, { VideoEditFormData } from '@/components/dashboard/VideoEditDialog';
import { useVideoLikes } from '@/hooks/useLikes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VideoCardDashboardProps {
  video: Video;
  category: { name: string } | undefined;
  onDelete: (videoId: string) => void;
}

const VideoCardDashboard: React.FC<VideoCardDashboardProps> = ({
  video,
  category,
  onDelete,
}) => {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isLiked, likesCount, toggleLike } = useVideoLikes(video.id, video.likes);

  const handleVideoClick = () => {
    setIsVideoDialogOpen(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: VideoEditFormData) => {
    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: data.title,
          description: data.description,
          category_id: data.categoryId,
          thumbnail_url: data.thumbnailUrl
        })
        .eq('id', video.id);

      if (error) throw error;

      toast.success('Video updated successfully');
      setIsEditDialogOpen(false);
      // Force a page reload to update the video list
      window.location.reload();
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Failed to update video');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover-scale">
        <div 
          className="relative aspect-video cursor-pointer" 
          onClick={handleVideoClick}
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          {category && (
            <div className="absolute bottom-3 left-3 rounded-full px-2 py-1 bg-primary/90 text-xs text-white">
              {category.name}
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{video.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {video.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-sm text-muted-foreground pb-0">
          <div className="flex space-x-4">
            <div>{video.views} views</div>
            <div 
              className="flex items-center cursor-pointer" 
              onClick={handleLikeClick}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 mr-1",
                  isLiked ? "text-red-500" : "text-muted-foreground"
                )} 
                fill={isLiked ? "currentColor" : "none"} 
              />
              <span>{likesCount} likes</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(video.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      <VideoPlayerDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        videoUrl={video.videoUrl}
        title={video.title}
      />

      <VideoEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        video={video}
        categories={categories}
        isLoading={isEditing}
      />
    </>
  );
};

export default VideoCardDashboard;
