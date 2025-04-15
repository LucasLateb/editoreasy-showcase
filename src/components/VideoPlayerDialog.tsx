
import React, { useEffect, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
}

const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Auto-play video when dialog opens (for native video element)
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
    }
  }, [isOpen]);

  // Function to convert YouTube URLs to embed format
  const getYouTubeEmbedUrl = (url: string): string | null => {
    // Handle various YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      // Return YouTube embed URL
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    
    return null;
  };
  
  // Check if the videoUrl is an embed code (contains iframe)
  const isEmbedCode = videoUrl.includes('<iframe');
  
  // Extract the src URL from embed code
  let embedSrc = '';
  if (isEmbedCode) {
    const srcMatch = videoUrl.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      embedSrc = srcMatch[1];
    }
  }
  
  // Check if it's a YouTube URL that needs to be converted
  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[95vw] p-1 overflow-hidden">
        <DialogDescription className="sr-only">
          Video player for {title}
        </DialogDescription>
        
        <div className="absolute top-2 right-2 z-10">
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>
        
        <div className="overflow-hidden rounded">
          {isEmbedCode && embedSrc ? (
            <div className="w-full aspect-video">
              <iframe 
                src={embedSrc}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title={title}
              />
            </div>
          ) : youtubeEmbedUrl ? (
            <div className="w-full aspect-video">
              <iframe 
                src={youtubeEmbedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title={title}
              />
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={videoUrl} 
              controls
              autoPlay
              className="w-full aspect-video"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        
        <DialogTitle className="px-3 pb-2">{title}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
