
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { Image as CustomImage } from '@/components/ui/image';

interface ShowreelSectionProps {
  showreelUrl: string;
  showreelThumbnail: string;
  editMode: boolean;
}

const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreelUrl,
  showreelThumbnail,
  editMode
}) => {
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  
  useEffect(() => {
    if (showreelThumbnail) {
      // Précharger l'image
      const img = new window.Image();
      img.src = showreelThumbnail;
      img.onload = () => {
        console.log('Showreel thumbnail preloaded successfully:', showreelThumbnail);
        setThumbnailLoaded(true);
      };
      img.onerror = () => {
        console.error('Failed to preload showreel thumbnail:', showreelThumbnail);
      };
    }
  }, [showreelThumbnail]);
  
  // If there's no showreel URL and we're not in edit mode, don't render anything
  if (!showreelUrl && !editMode) {
    return null;
  }

  const handlePlayClick = () => {
    console.log('Play button clicked, opening video player');
    setVideoPlayerOpen(true);
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f';
  console.log('Portfolio: Setting showreel URL to:', showreelUrl);
  console.log('Portfolio: Setting showreel thumbnail to:', showreelThumbnail);

  return (
    <div className="mb-8 mt-2 bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium">My Showreel</h3>
      </div>
      {showreelUrl ? (
        <div className="aspect-video relative">
          <div className="relative w-full h-full">
            <CustomImage 
              src={showreelThumbnail || defaultThumbnail} 
              alt="Showreel thumbnail" 
              className="w-full h-full"
              fallbackSrc={defaultThumbnail}
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
      ) : editMode ? (
        <div className="aspect-video bg-muted flex items-center justify-center">
          <p className="text-muted-foreground">No showreel added yet.</p>
        </div>
      ) : null}

      {/* Video Player Dialog */}
      {showreelUrl && (
        <VideoPlayerDialog
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
          videoUrl={showreelUrl}
          title="My Showreel"
        />
      )}
    </div>
  );
};

export default ShowreelSection;
