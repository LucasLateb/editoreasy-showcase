
import React, { useState } from 'react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, X, Star, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getVideoAspectRatio } from '@/utils/videoHelpers';

interface VideoGridProps {
  videos: Video[];
  editMode: boolean;
  thumbnailOptions: Array<{ id: string; url: string }>;
  updateVideoThumbnail: (videoId: string, newThumbnailUrl: string) => void;
  toggleHighlight: (videoId: string) => void;
  setAsFeatured: (video: Video) => void;
  isViewOnly?: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  editMode,
  thumbnailOptions,
  updateVideoThumbnail,
  toggleHighlight,
  setAsFeatured,
  isViewOnly = false,
}) => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const handleUploadClick = () => {
    navigate('/dashboard');
  };
  
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };
  
  const handleToggleHighlight = async (videoId: string) => {
    setIsUpdating(videoId);
    
    // First call the parent component's toggleHighlight to update the local state
    toggleHighlight(videoId);
    
    // Find the video to get its current highlight status
    const video = videos.find(v => v.id === videoId);
    if (!video) {
      setIsUpdating(null);
      return;
    }
    
    // The toggle has already been applied in the UI, so we want the opposite of what's currently shown
    const newHighlightStatus = !video.isHighlighted;
    
    try {
      // Update the is_highlighted field in the videos table
      const { error } = await supabase
        .from('videos')
        .update({ is_highlighted: newHighlightStatus })
        .eq('id', videoId);
      
      if (error) throw error;
      
      toast.success(`Video ${newHighlightStatus ? 'highlighted' : 'unhighlighted'} successfully`);
    } catch (error) {
      console.error('Error updating highlight status:', error);
      toast.error('Failed to update highlight status');
      
      // Revert the UI change since the server update failed
      toggleHighlight(videoId);
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Group videos by aspect ratio
  const verticalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'vertical');
  const horizontalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'horizontal');
  
  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">No videos in your portfolio yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload videos from your dashboard to showcase your work in your portfolio.
          </p>
          {!isViewOnly && (
            <Button onClick={handleUploadClick} className="mx-auto">
              <Upload className="mr-2 h-4 w-4" />
              Upload Videos
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* New mixed layout: horizontal videos on the left, vertical videos on the right */}
      <div className="flex gap-6">
        {/* Left side: Horizontal videos in grid */}
        <div className="flex-1">
          {horizontalVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {horizontalVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="relative group cursor-pointer" 
                  onClick={() => handleVideoClick(video)}
                >
                  <VideoCard video={video} />
                  
                  {editMode && !isViewOnly && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex space-x-1" onClick={(e) => e.stopPropagation()}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Video</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              {thumbnailOptions.map(thumbnail => (
                                <Card 
                                  key={thumbnail.id} 
                                  className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                  onClick={() => updateVideoThumbnail(video.id, thumbnail.url)}
                                >
                                  <CardContent className="p-2">
                                    <div className="aspect-video relative overflow-hidden rounded">
                                      <img 
                                        src={thumbnail.url} 
                                        alt={`Thumbnail option ${thumbnail.id}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <div className="flex justify-between">
                              <Button 
                                variant={video.isHighlighted ? "destructive" : "outline"}
                                onClick={() => handleToggleHighlight(video.id)}
                                disabled={isUpdating === video.id}
                              >
                                {video.isHighlighted ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Remove Highlight
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Highlight Video
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                variant="default"
                                onClick={() => setAsFeatured(video)}
                                disabled={isUpdating === video.id}
                              >
                                Set as Featured
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right side: Vertical videos in single column */}
        {verticalVideos.length > 0 && (
          <div className="w-[300px] flex-shrink-0">
            <div className="space-y-4">
              {verticalVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="relative group cursor-pointer"
                  onClick={() => handleVideoClick(video)}
                >
                  <VideoCard video={video} />
                  
                  {editMode && !isViewOnly && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur-sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Video</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              {thumbnailOptions.map(thumbnail => (
                                <Card 
                                  key={thumbnail.id} 
                                  className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                  onClick={() => updateVideoThumbnail(video.id, thumbnail.url)}
                                >
                                  <CardContent className="p-2">
                                    <div className="aspect-[9/16] relative overflow-hidden rounded">
                                      <img 
                                        src={thumbnail.url} 
                                        alt={`Thumbnail option ${thumbnail.id}`} 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <div className="flex justify-between">
                              <Button 
                                variant={video.isHighlighted ? "destructive" : "outline"}
                                onClick={() => handleToggleHighlight(video.id)}
                                disabled={isUpdating === video.id}
                              >
                                {video.isHighlighted ? (
                                  <>
                                    <X className="mr-2 h-4 w-4" />
                                    Remove
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Highlight
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                variant="default"
                                onClick={() => setAsFeatured(video)}
                                disabled={isUpdating === video.id}
                              >
                                Set as Featured
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedVideo && (
        <VideoPlayerDialog
          isOpen={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
          description={selectedVideo.description}
          editorId={selectedVideo.userId}
        />
      )}
    </>
  );
};

export default VideoGrid;
