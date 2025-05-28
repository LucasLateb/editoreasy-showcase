
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
import { Image } from '@/components/ui/image';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      // Handle base64 image upload if the thumbnailUrl starts with "data:"
      let finalThumbnailUrl = data.thumbnailUrl;
      if (data.thumbnailUrl.startsWith('data:')) {
        const base64Data = data.thumbnailUrl.split(',')[1];
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(`${video.id}-${Date.now()}.jpg`, decode(base64Data), {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(uploadData.path);
          
        finalThumbnailUrl = publicUrl;
      }

      const { error } = await supabase
        .from('videos')
        .update({
          title: data.title,
          description: data.description,
          category_id: data.categoryId,
          thumbnail_url: finalThumbnailUrl
        })
        .eq('id', video.id);

      if (error) throw error;

      toast.success(t('Common.VideoUpdatedSuccess'));
      setIsEditDialogOpen(false);
      // Force a page reload to update the video list
      window.location.reload();
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error(t('Common.VideoUpdateFailed'));
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
          <Image 
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
            <div>{video.views} {t('VideoCard.Views')}</div>
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
              <span>{likesCount} {t('VideoCard.Likes')}</span>
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
            {t('VideoCard.Edit')}
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(video.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {t('VideoCard.Delete')}
          </Button>
        </CardFooter>
      </Card>

      <VideoPlayerDialog
        isOpen={isVideoDialogOpen}
        onClose={() => setIsVideoDialogOpen(false)}
        videoUrl={video.videoUrl}
        title={video.title}
        videoId={video.id}
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

// Helper function to decode base64
function decode(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default VideoCardDashboard;
