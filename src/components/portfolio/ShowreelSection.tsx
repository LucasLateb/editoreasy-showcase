
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

  // Handle hover video playback for embed URLs
  useEffect(() => {
    if (isHovered && videoRef.current && isVideoUrl(showreelUrl)) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    } else if (!isHovered && videoRef.current && isVideoUrl(showreelUrl)) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered, showreelUrl]);
  
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

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    let match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&autohide=1&modestbranding=1`;
    }
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(?:video\/|)(\d+)/i;
    match = url.match(vimeoRegex);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}?background=1&autoplay=1&autopause=0&muted=1`;
    }
    // Direct video link (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
    // Check for iframe embed code
    const iframeSrcRegex = /<iframe.*?src=["'](.*?)["']/;
    match = url.match(iframeSrcRegex);
    if (match && match[1]) {
      const src = match[1];
      const urlObj = new URL(src);
      urlObj.searchParams.set('autoplay', '1');
      urlObj.searchParams.set('mute', '1');
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        urlObj.searchParams.set('loop', '1');
        const videoId = src.split('/').pop()?.split('?')[0] || '';
        if(videoId) urlObj.searchParams.set('playlist', videoId);
        urlObj.searchParams.set('controls', '0');
      } else if (src.includes('vimeo.com')) {
        urlObj.searchParams.set('loop', '1');
        urlObj.searchParams.set('autopause', '0');
        urlObj.searchParams.set('controls', '0');
      }
      return urlObj.toString();
    }
    return null;
  };

  const defaultThumbnail = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f';
  const effectiveShowreelUrl = getEmbedUrl(showreelUrl);
  const isDirectVideo = effectiveShowreelUrl && effectiveShowreelUrl.match(/\.(mp4|webm|ogg)$/i);

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
            {(isHovered && effectiveShowreelUrl) ? (
              isDirectVideo ? (
                <video
                  ref={videoRef}
                  src={effectiveShowreelUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <iframe
                  src={effectiveShowreelUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; muted"
                  allowFullScreen
                  title="Showreel"
                />
              )
            ) : (
              <CustomImage 
                src={showreelThumbnail || defaultThumbnail} 
                alt="Showreel thumbnail" 
                className="w-full h-full"
                fallbackSrc={defaultThumbnail}
              />
            )}
            
            {/* Play button overlay */}
            {!isHovered && (
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                isHovered ? 'bg-black/30' : 'bg-black/0'
              }`}>
                <div className={`rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 w-20 h-20`}>
                  <Play className="h-10 w-10 text-white" fill="white" />
                </div>
              </div>
            )}

            {/* Hover effects */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm">
                {isHovered ? 'Click for full screen' : 'Hover to preview'}
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
