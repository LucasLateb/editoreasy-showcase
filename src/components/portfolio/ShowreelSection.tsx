
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayStarted, setAutoPlayStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Simplified approach - we'll trust the Image component to handle loading
  useEffect(() => {
    if (showreelThumbnail) {
      setThumbnailLoaded(true);
    }
  }, [showreelThumbnail]);

  // Auto-play video when component mounts (like YouTube)
  useEffect(() => {
    if (videoRef.current && isVideoUrl(showreelUrl) && !autoPlayStarted) {
      const timer = setTimeout(() => {
        videoRef.current?.play().then(() => {
          setIsPlaying(true);
          setAutoPlayStarted(true);
        }).catch(console.error);
      }, 500); // Small delay to ensure video is loaded
      
      return () => clearTimeout(timer);
    }
  }, [showreelUrl, autoPlayStarted]);
  
  // If there's no showreel URL and we're not in edit mode, don't render anything
  if (!showreelUrl && !editMode) {
    return null;
  }

  const handlePlayClick = () => {
    console.log('Play button clicked, opening video player');
    setVideoPlayerOpen(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleVideoClick = () => {
    if (videoRef.current && isVideoUrl(showreelUrl)) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    } else {
      handlePlayClick();
    }
  };

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    // Check if it's a direct video URL (mp4, webm, etc.) and not an embed code
    return (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) && !url.includes('<iframe');
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f';

  return (
    <div className="mb-8 mt-2 bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium">My Showreel</h3>
      </div>
      {showreelUrl ? (
        <div 
          className="aspect-video relative group cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleVideoClick}
        >
          <div className="relative w-full h-full overflow-hidden">
            {isVideoUrl(showreelUrl) ? (
              <>
                {/* Video element for direct video URLs */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  <source src={showreelUrl} type="video/mp4" />
                </video>
                
                {/* Thumbnail overlay - only show when video is not playing */}
                {!isPlaying && (
                  <div className="absolute inset-0">
                    <CustomImage 
                      src={showreelThumbnail || defaultThumbnail} 
                      alt="Showreel thumbnail" 
                      className="w-full h-full"
                      fallbackSrc={defaultThumbnail}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Static thumbnail for embed URLs */
              <CustomImage 
                src={showreelThumbnail || defaultThumbnail} 
                alt="Showreel thumbnail" 
                className="w-full h-full"
                fallbackSrc={defaultThumbnail}
              />
            )}
            
            {/* Play/Pause button overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              isHovered ? 'bg-black/30' : 'bg-black/0'
            }`}>
              {(isHovered || !isPlaying) && (
                <div className={`rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
                  isHovered ? 'w-24 h-24 bg-primary' : 'w-20 h-20'
                }`}>
                  {isPlaying && isVideoUrl(showreelUrl) ? (
                    <Pause className="h-10 w-10 text-white" fill="white" />
                  ) : (
                    <Play className="h-10 w-10 text-white" fill="white" />
                  )}
                </div>
              )}
            </div>

            {/* Hover effects */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
                {isVideoUrl(showreelUrl) ? 'Click to play/pause • Click play button for full screen' : 'Click to watch'}
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
