
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Edit, Link } from 'lucide-react';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';

interface ShowreelSectionProps {
  showreelUrl: string;
  showreelThumbnail: string;
  editMode: boolean;
  showreelDialogOpen: boolean;
  setShowreelDialogOpen: (open: boolean) => void;
  setShowreelUrl: (url: string) => void;
  updateShowreel: (url: string) => void;
  updateShowreelThumbnail: (url: string) => void;
  thumbnailOptions: Array<{ id: string; url: string }>;
}

const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreelUrl,
  showreelThumbnail,
  editMode,
  showreelDialogOpen,
  setShowreelDialogOpen,
  setShowreelUrl,
  updateShowreel,
  updateShowreelThumbnail,
  thumbnailOptions
}) => {
  // Use state to control the video player dialog
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  
  // If there's no showreel URL and we're not in edit mode, don't render anything
  if (!showreelUrl && !editMode) {
    return null;
  }

  // Check if the URL is actually an embed code (contains iframe)
  const isEmbedCode = showreelUrl && typeof showreelUrl === 'string' && showreelUrl.includes('<iframe');
  
  // Extract the src URL from an embed code if needed
  const extractSrcFromEmbed = (embedCode: string) => {
    try {
      const srcMatch = embedCode.match(/src="([^"]+)"/);
      return srcMatch && srcMatch[1] ? srcMatch[1] : '';
    } catch (error) {
      console.error('Error extracting src from embed code:', error);
      return '';
    }
  };
  
  // Get the actual URL to use in the iframe
  let iframeSrc = '';
  if (isEmbedCode && showreelUrl) {
    iframeSrc = extractSrcFromEmbed(showreelUrl);
  } else if (showreelUrl) {
    // Just use the URL as is
    iframeSrc = showreelUrl;
  }

  // Validate the URL to prevent malformed URIs
  const isValidUrl = () => {
    if (!iframeSrc) return false;
    
    try {
      // Basic URL validation
      if (iframeSrc.startsWith('http://') || iframeSrc.startsWith('https://')) {
        // This will throw if the URL is malformed
        new URL(iframeSrc);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Invalid URL format:", e);
      return false;
    }
  };

  const handlePlayClick = () => {
    setVideoPlayerOpen(true);
  };

  return (
    <div className="mb-8 mt-2 bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium">My Showreel</h3>
        {editMode && (
          <Dialog open={showreelDialogOpen} onOpenChange={setShowreelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Showreel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Showreel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label htmlFor="showreel-url" className="text-sm font-medium mb-2 block">
                    Showreel URL (YouTube, Vimeo, etc.)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="showreel-url"
                      value={showreelUrl || ''}
                      onChange={(e) => setShowreelUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/your-video-id"
                      className="flex-1"
                    />
                    <Button onClick={() => updateShowreel(showreelUrl || '')}>
                      <Link className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an embed URL from YouTube or Vimeo for best results
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Showreel Thumbnail</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {thumbnailOptions.map(thumbnail => (
                      <Card 
                        key={thumbnail.id} 
                        className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                        onClick={() => updateShowreelThumbnail(thumbnail.url)}
                      >
                        <CardContent className="p-1">
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
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="aspect-video relative">
        <div className="relative w-full h-full">
          <img 
            src={showreelThumbnail} 
            alt="Showreel thumbnail" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer"
              onClick={handlePlayClick}
            >
              <Play className="h-10 w-10 text-white" fill="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Dialog */}
      <VideoPlayerDialog
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        videoUrl={showreelUrl}
        title="My Showreel"
      />
    </div>
  );
};

export default ShowreelSection;
