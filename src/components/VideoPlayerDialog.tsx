
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
    // Auto-play video when dialog opens
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error auto-playing video:', err);
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] p-1 overflow-hidden">
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
          <video 
            ref={videoRef}
            src={videoUrl} 
            controls
            autoPlay
            className="w-full aspect-video"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        <DialogTitle className="px-3 pb-2">{title}</DialogTitle>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerDialog;
