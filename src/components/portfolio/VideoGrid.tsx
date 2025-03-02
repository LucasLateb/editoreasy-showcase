
import React from 'react';
import { Video } from '@/types';
import VideoCard from '@/components/VideoCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, X, Star, Upload, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VideoGridProps {
  videos: Video[];
  editMode: boolean;
  thumbnailOptions: Array<{ id: string; url: string }>;
  updateVideoThumbnail: (videoId: string, newThumbnailUrl: string) => void;
  toggleHighlight: (videoId: string) => void;
  setAsFeatured: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  editMode,
  thumbnailOptions,
  updateVideoThumbnail,
  toggleHighlight,
  setAsFeatured
}) => {
  const navigate = useNavigate();
  
  const handleUploadClick = () => {
    navigate('/dashboard');
  };
  
  if (videos.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium mb-2">No videos in your portfolio yet</h3>
          <p className="text-muted-foreground mb-6">
            Upload videos from your dashboard to showcase your work in your portfolio.
          </p>
          <Button onClick={handleUploadClick} className="mx-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload Videos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div key={video.id} className="relative group">
          <VideoCard video={video} />
          
          {editMode && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex space-x-1">
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
                        onClick={() => toggleHighlight(video.id)}
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
  );
};

export default VideoGrid;
