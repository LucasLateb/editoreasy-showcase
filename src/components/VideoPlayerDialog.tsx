
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useViewTracking } from '@/hooks/useViewTracking';
import { getEmbedUrl, isEmbedCode } from '@/lib/videoUtils';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && videoId) {
      recordVideoView(videoId);
    }
  }, [isOpen, videoId, recordVideoView]);

  const handleEditorClick = () => {
    if (editorId) {
      navigate(`/portfolio/${editorId}`);
      onClose();
    }
  };

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
      <DialogContent className="max-w-6xl w-full h-[85vh] p-0 overflow-hidden">
        <div className="relative w-full h-full bg-black flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Video Player Section */}
          <div className="w-full h-[60%] bg-black">
            {renderVideo()}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 bg-background p-6 overflow-y-auto">
            {/* Video Title */}
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            
            {/* Editor Information */}
            {(editorName || editorId) && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={editorAvatar} alt={editorName} />
                  <AvatarFallback>
                    {editorName ? editorName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{editorName || 'Unknown Editor'}</p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
                {editorId && (
                  <Button 
                    variant="outline" 
                    onClick={handleEditorClick}
                    className="ml-auto"
                  >
                    View Portfolio
                  </Button>
                )}
              </div>
            )}
            
            {/* Description Section */}
            {description && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
