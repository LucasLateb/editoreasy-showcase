
import React, { useState } from 'react';
import { Video } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Film, ExternalLink, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ShowreelTabProps {
  videos: Video[];
  isLoading: boolean;
  onSetShowreel: (videoUrl: string, thumbnailUrl?: string) => void;
  currentShowreelUrl: string | null;
  currentShowreelThumbnail: string | null;
}

const ShowreelTab: React.FC<ShowreelTabProps> = ({ 
  videos: localVideos, 
  isLoading: localIsLoading, 
  onSetShowreel,
  currentShowreelUrl: localCurrentShowreelUrl,
  currentShowreelThumbnail: localCurrentShowreelThumbnail
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [videoToConfirm, setVideoToConfirm] = useState<Video | null>(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const { toast: localToast } = useToast();
  
  const handleSelectShowreel = (video: Video) => {
    setVideoToConfirm(video);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmShowreel = () => {
    if (videoToConfirm) {
      try {
        if (videoToConfirm.videoUrl.includes('<iframe')) {
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else if (videoToConfirm.videoUrl.startsWith('http://') || videoToConfirm.videoUrl.startsWith('https://')) {
          new URL(videoToConfirm.videoUrl);
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else {
          throw new Error('Invalid URL format');
        }
        
        setSelectedVideo(videoToConfirm);
        localToast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
      } catch (error) {
        console.error("Invalid video URL:", error);
        localToast({
          title: "Invalid URL",
          description: "The selected video has an invalid URL format.",
          variant: "destructive"
        });
      }
    }
    setConfirmDialogOpen(false);
    setVideoToConfirm(null);
  };
  
  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      try {
        if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://') && !customUrl.includes('<iframe')) {
          throw new Error('URL must start with http:// or https:// or be an iframe embed code');
        }
        
        onSetShowreel(customUrl.trim(), customThumbnailUrl || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81');
        localToast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
        setCustomUrl('');
        setCustomThumbnailUrl('');
      } catch (error) {
        console.error("Invalid custom URL:", error);
        localToast({
          title: "Invalid URL",
          description: error instanceof Error ? error.message : "The URL format is invalid.",
          variant: "destructive"
        });
      }
    }
  };
  
  if (localIsLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const isEmbedCode = localCurrentShowreelUrl && localCurrentShowreelUrl.includes('<iframe');
  const extractSrcFromEmbed = (embedCode: string) => {
    try {
      const srcMatch = embedCode.match(/src="([^"]+)"/);
      return srcMatch && srcMatch[1] ? srcMatch[1] : '';
    } catch (error) {
      console.error('Error extracting src from embed code:', error);
      return '';
    }
  };
  
  let displayUrl = '';
  if (isEmbedCode && localCurrentShowreelUrl) {
    displayUrl = extractSrcFromEmbed(localCurrentShowreelUrl);
  } else if (localCurrentShowreelUrl) {
    displayUrl = localCurrentShowreelUrl;
  }
  
  return (
    <div className="space-y-8">
      {/* Current Showreel Section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Current Showreel</CardTitle>
              <CardDescription>
                This video will be prominently displayed on your portfolio page
              </CardDescription>
            </div>
            {localCurrentShowreelUrl && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {localCurrentShowreelUrl ? (
            <div className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={localCurrentShowreelThumbnail || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81'} 
                  alt="Showreel thumbnail" 
                  className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setVideoPlayerOpen(true)}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                  <Button 
                    size="lg"
                    className="rounded-full w-16 h-16 p-0 bg-white/90 hover:bg-white text-black hover:text-black shadow-lg"
                    onClick={() => setVideoPlayerOpen(true)}
                  >
                    <Play className="h-6 w-6 ml-1" fill="currentColor" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">{displayUrl}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-muted aspect-video rounded-lg border-2 border-dashed border-muted-foreground/20">
              <Film className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No showreel set</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Select a video from your collection or add a custom URL to set your showreel
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Video Player Dialog */}
      {localCurrentShowreelUrl && (
        <VideoPlayerDialog
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
          videoUrl={localCurrentShowreelUrl}
          title="My Showreel"
        />
      )}

      {/* Select from Your Videos Section */}
      {localVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Select from Your Videos</CardTitle>
            <CardDescription>
              Choose one of your uploaded videos to use as your showreel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {localVideos.map((video) => (
                <div 
                  key={video.id} 
                  className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                    selectedVideo?.id === video.id 
                      ? 'ring-2 ring-primary border-primary shadow-md' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectShowreel(video)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="currentColor" />
                    </div>
                    {selectedVideo?.id === video.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-background">
                    <h3 className="font-medium text-sm truncate mb-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Custom URL Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Set Custom Showreel URL</CardTitle>
          <CardDescription>
            Add a video from YouTube, Vimeo, or any other platform using a direct link or embed code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url" className="text-sm font-medium">
                Video URL or Embed Code
              </Label>
              <Input
                id="video-url"
                type="text" 
                value={customUrl} 
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/your-video-id or <iframe>...</iframe>"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Use an embed URL from YouTube/Vimeo or paste the full embed code for best results
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="thumbnail-url" className="text-sm font-medium">
                Custom Thumbnail URL (optional)
              </Label>
              <Input
                id="thumbnail-url"
                type="text" 
                value={customThumbnailUrl} 
                onChange={(e) => setCustomThumbnailUrl(e.target.value)}
                placeholder="https://example.com/your-thumbnail-image.jpg"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use a default thumbnail image
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleCustomUrlSubmit} 
              disabled={!customUrl.trim()}
              className="min-w-[140px]"
            >
              Set as Showreel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmShowreel}
        title="Set as Showreel"
        description={`Are you sure you want to set "${videoToConfirm?.title}" as your showreel? This will replace your current showreel and be visible on your portfolio page.`}
        confirmLabel="Set as Showreel"
        cancelLabel="Cancel"
      />
    </div>
  );
};

export default ShowreelTab;
