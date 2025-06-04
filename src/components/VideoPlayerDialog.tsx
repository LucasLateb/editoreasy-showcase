import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewTracking } from '@/hooks/useViewTracking';
import { getEmbedUrl, isEmbedCode } from '@/lib/videoUtils';

interface VideoPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  videoId?: string;
  description?: string;
  editorId?: string;
  editorName?: string;
  editorAvatar?: string;
}

const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  title,
  videoId,
  description,
  editorId,
  editorName,
  editorAvatar
}) => {
  const { recordVideoView } = useViewTracking();

  useEffect(() => {
    if (isOpen && videoId) {
      recordVideoView(videoId);
    }
  }, [isOpen, videoId, recordVideoView]);

  const renderVideo = () => {
    if (!videoUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-muted">
          <p className="text-muted-foreground">Video not available</p>
        </div>
      );
    }

    const embedUrl = getEmbedUrl(videoUrl);
    
    // Handle Vimeo embed codes
    if (isEmbedCode(embedUrl)) {
      return (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: embedUrl }}
        />
      );
    }
    
    // Handle YouTube, Google Drive, and other direct URLs
    if (embedUrl.includes('youtube.com/embed') || 
        embedUrl.includes('drive.google.com/file') ||
        embedUrl.includes('vimeo.com')) {
      return (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    // Handle direct video files
    return (
      <video
        src={embedUrl}
        title={title}
        className="w-full h-full"
        controls
        autoPlay
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
        <div className="relative w-full h-full bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="w-full h-full">
            {renderVideo()}
          </div>
          
          {(title || description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              {description && (
                <p className="text-white/80 text-sm">{description}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
