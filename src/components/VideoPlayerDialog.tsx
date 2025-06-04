
import React, { useEffect, useState } from 'react';
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
  const [videoAspectRatio, setVideoAspectRatio] = useState<'wide' | 'standard' | 'vertical' | 'square'>('standard');

  useEffect(() => {
    if (isOpen && videoId) {
      recordVideoView(videoId);
    }
  }, [isOpen, videoId, recordVideoView]);

  // Detect video aspect ratio from URL patterns or iframe content
  useEffect(() => {
    if (videoUrl) {
      const embedUrl = getEmbedUrl(videoUrl);
      
      // YouTube Shorts detection
      if (embedUrl.includes('youtube.com/embed') && videoUrl.includes('shorts')) {
        setVideoAspectRatio('vertical');
      }
      // Instagram/TikTok vertical content patterns
      else if (videoUrl.includes('instagram.com') || videoUrl.includes('tiktok.com')) {
        setVideoAspectRatio('vertical');
      }
      // Default to standard for most content
      else {
        setVideoAspectRatio('standard');
      }
    }
  }, [videoUrl]);

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
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: embedUrl }}
        />
      );
    }
    
    // Handle YouTube, Google Drive, and other direct URLs
    if (embedUrl.includes('youtube.com/embed') || 
        embedUrl.includes('drive.google.com/file') ||
        embedUrl.includes('vimeo.com')) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <iframe
            src={embedUrl}
            title={title}
            className={`${getVideoSizeClasses()} border-0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    
    // Handle direct video files
    return (
      <div className="w-full h-full flex items-center justify-center">
        <video
          src={embedUrl}
          title={title}
          className={getVideoSizeClasses()}
          controls
          autoPlay
        />
      </div>
    );
  };

  const getVideoSizeClasses = () => {
    switch (videoAspectRatio) {
      case 'vertical':
        return 'h-full max-h-[70vh] w-auto max-w-[40vw]';
      case 'square':
        return 'h-full max-h-[60vh] w-auto aspect-square';
      case 'wide':
        return 'w-full h-auto max-h-[70vh]';
      default:
        return 'w-full h-full max-h-[70vh]';
    }
  };

  const getDialogClasses = () => {
    switch (videoAspectRatio) {
      case 'vertical':
        return 'max-w-7xl w-[95vw] h-[95vh]';
      case 'square':
        return 'max-w-5xl w-[90vw] h-[90vh]';
      case 'wide':
        return 'max-w-[95vw] w-[95vw] h-[90vh]';
      default:
        return 'max-w-6xl w-[90vw] h-[85vh]';
    }
  };

  const getLayoutClasses = () => {
    if (videoAspectRatio === 'vertical') {
      return 'flex flex-row';
    }
    return 'flex flex-col';
  };

  const getVideoContainerClasses = () => {
    if (videoAspectRatio === 'vertical') {
      return 'flex-1 bg-black flex items-center justify-center min-h-0';
    }
    return 'w-full bg-black flex items-center justify-center' + 
           (videoAspectRatio === 'wide' ? ' h-[65%]' : ' h-[60%]');
  };

  const getContentClasses = () => {
    if (videoAspectRatio === 'vertical') {
      return 'w-80 bg-background p-6 overflow-y-auto border-l';
    }
    return 'flex-1 bg-background p-6 overflow-y-auto';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getDialogClasses()} p-0 overflow-hidden`}>
        <div className={`relative w-full h-full bg-black ${getLayoutClasses()}`}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {/* Video Player Section */}
          <div className={getVideoContainerClasses()}>
            {renderVideo()}
          </div>
          
          {/* Content Section */}
          <div className={getContentClasses()}>
            {/* Video Title */}
            <h2 className={`font-bold mb-4 ${videoAspectRatio === 'vertical' ? 'text-lg' : 'text-2xl'}`}>
              {title}
            </h2>
            
            {/* Editor Information */}
            {(editorName || editorId) && (
              <div className={`flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-lg ${videoAspectRatio === 'vertical' ? 'flex-col text-center' : ''}`}>
                <Avatar className={videoAspectRatio === 'vertical' ? 'h-10 w-10' : 'h-12 w-12'}>
                  <AvatarImage src={editorAvatar} alt={editorName} />
                  <AvatarFallback>
                    {editorName ? editorName.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 ${videoAspectRatio === 'vertical' ? 'text-center' : ''}`}>
                  <p className={`font-semibold ${videoAspectRatio === 'vertical' ? 'text-base' : 'text-lg'}`}>
                    {editorName || 'Unknown Editor'}
                  </p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
                {editorId && (
                  <Button 
                    variant="outline" 
                    onClick={handleEditorClick}
                    className={`${videoAspectRatio === 'vertical' ? 'w-full mt-2' : 'ml-auto'}`}
                    size={videoAspectRatio === 'vertical' ? 'sm' : 'default'}
                  >
                    View Portfolio
                  </Button>
                )}
              </div>
            )}
            
            {/* Description Section */}
            {description && (
              <div className="space-y-3">
                <h3 className={`font-semibold ${videoAspectRatio === 'vertical' ? 'text-base' : 'text-lg'}`}>
                  Description
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${videoAspectRatio === 'vertical' ? 'text-sm' : ''}`}>
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
