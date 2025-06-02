
import React, { useState } from 'react';
import { Video } from '@/types';
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
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Image } from '@/components/ui/image';

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
  const { categories } = useCategories();

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
      <Card className="overflow-hidden transition-all duration-500 ease-out transform-gpu hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-2 group">
        <div 
          className="relative aspect-video cursor-pointer overflow-hidden" 
          onClick={handleVideoClick}
        >
          <Image 
            src={video.thumbnailUrl} 
            alt={video.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
          {category && (
            <div className="absolute bottom-3 left-3 rounded-full px-3 py-1 bg-primary/90 backdrop-blur-sm text-xs text-white font-medium shadow-lg transition-transform duration-300 group-hover:scale-105">
              {category.name}
            </div>
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl">
              <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
        
        <CardHeader className="pb-2 transition-transform duration-300 group-hover:translate-y-0">
          <CardTitle className="text-lg transition-colors duration-300 group-hover:text-primary">{video.title}</CardTitle>
          <CardDescription className="line-clamp-2 transition-colors duration-300 group-hover:text-foreground/80">
            {video.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-sm text-muted-foreground pb-0 transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex space-x-4">
            <div className="transition-colors duration-300 group-hover:text-foreground">{video.views} views</div>
            <div 
              className="flex items-center cursor-pointer transition-all duration-300 hover:scale-110" 
              onClick={handleLikeClick}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 mr-1 transition-all duration-300",
                  isLiked ? "text-red-500 scale-110" : "text-muted-foreground group-hover:text-foreground"
                )} 
                fill={isLiked ? "currentColor" : "none"} 
              />
              <span className="transition-colors duration-300 group-hover:text-foreground">{likesCount} likes</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4 transition-transform duration-300 group-hover:translate-y-0">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleEditClick}
            className="transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(video.id)}
            className="transition-all duration-300 hover:scale-105 hover:shadow-md"
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
