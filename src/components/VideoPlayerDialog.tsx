
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
  
  // Function to convert Vimeo URLs to embed format
  const getVimeoEmbedUrl = (url: string): string | null => {
    // Handle various Vimeo URL formats
    const vimeoRegex = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|)(\d+)(?:|\/\?)/i;
    const match = url.match(vimeoRegex);
    
    if (match && match[1]) {
      // Return Vimeo embed URL
      return `https://player.vimeo.com/video/${match[1]}`;
    }
    
    return null;
  };
  
  // Parse embed code to extract iframe src
  const getEmbedSrc = (embedCode: string): string | null => {
    const srcMatch = embedCode.match(/src=["']([^"']+)["']/i);
    return srcMatch && srcMatch[1] ? srcMatch[1] : null;
  };
  
  // Determine content type and source
  const determineVideoSource = () => {
    // If it's an empty string or undefined, return null
    if (!videoUrl) return { type: 'none', src: null };
    
    // Check if it's an embed code (contains iframe)
    if (videoUrl.includes('<iframe')) {
      const src = getEmbedSrc(videoUrl);
      return { type: 'embed', src };
    }
    
    // Check if it's a YouTube URL
    const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);
    if (youtubeEmbed) {
      return { type: 'youtube', src: youtubeEmbed };
    }
    
    // Check if it's a Vimeo URL
    const vimeoEmbed = getVimeoEmbedUrl(videoUrl);
    if (vimeoEmbed) {
      return { type: 'vimeo', src: vimeoEmbed };
    }
    
    // Default to treating it as a direct video URL
    return { type: 'video', src: videoUrl };
  };
  
  const videoSource = determineVideoSource();

  // If we have no source, don't render anything
  if (videoSource.type === 'none' || !videoSource.src) {
    return null;
  }
  
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
          {(videoSource.type === 'embed' || videoSource.type === 'youtube' || videoSource.type === 'vimeo') ? (
            <div className="w-full aspect-video">
              <iframe 
                src={videoSource.src}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                allowFullScreen
                title={title}
              />
            </div>
          ) : (
            <video 
              ref={videoRef}
              src={videoSource.src} 
              controls
              autoPlay
              className="w-full aspect-video"
              playsInline
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
