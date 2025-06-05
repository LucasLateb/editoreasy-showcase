
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Eye, Play, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useVideoLikes } from '@/hooks/useLikes';
import { 
  isTikTokEmbed, 
  getYouTubeVideoId,
  isYouTubeShorts,
  getVideoAspectRatio 
} from '@/utils/videoHelpers';

interface VideoCardProps {
  video: Video;
  className?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isLiked, likesCount, toggleLike } = useVideoLikes(video.id, video.likes);

  const videoId = getYouTubeVideoId(video.videoUrl);
  const isYoutube = !!videoId;
  const isTiktok = isTikTokEmbed(video.videoUrl);
  const isYoutubeShorts = isYouTubeShorts(video.videoUrl);
  const isVertical = getVideoAspectRatio(video.videoUrl) === 'vertical';
  
  console.log('VideoCard - YouTube video ID:', videoId);
  console.log('VideoCard - Is YouTube:', isYoutube);
  console.log('VideoCard - Is YouTube Shorts:', isYoutubeShorts);
  console.log('VideoCard - Is TikTok:', isTiktok);
  console.log('VideoCard - Is Vertical:', isVertical);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if ((isYoutube || isTiktok || isYoutubeShorts) && !isPlaying) {
      setTimeout(() => {
        setIsPlaying(true);
        setShowThumbnail(false);
      }, 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isPlaying) {
      setIsPlaying(false);
      setShowThumbnail(true);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike();
  };

  const renderVideoContent = () => {
    if (isPlaying && (isYoutube || isYoutubeShorts) && videoId) {
      return (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&loop=1&playlist=${videoId}`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    if (isPlaying && isTiktok) {
      return (
        <iframe
          ref={iframeRef}
          src={`${video.videoUrl}?autoplay=1&muted=1`}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      );
    }

    return (
      <>
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3 transform scale-110">
              <Play className="h-6 w-6 text-black fill-current" />
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Card 
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1", 
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(
        "relative overflow-hidden",
        // Increased height for horizontal videos to better match vertical proportions
        isVertical ? "aspect-[9/16]" : "aspect-[16/10]" // Changed from aspect-video (16/9) to 16/10 for more height
      )}>
        {renderVideoContent()}
        
        {(isYoutubeShorts || isTiktok) && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-red-500 text-white text-xs">
              {isYoutubeShorts ? 'Shorts' : 'TikTok'}
            </Badge>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-3">
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:scale-110 transition-transform" 
                onClick={handleLikeClick}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    isLiked ? "text-red-500 fill-current" : "text-white"
                  )} 
                />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{video.views}</span>
              </div>
            </div>
            
            {video.editorTier && video.editorTier !== 'free' && (
              <Badge variant="secondary" className={cn(
                "text-xs",
                video.editorTier === 'pro' ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'
              )}>
                {video.editorTier.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-medium mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        
        {video.editorName && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarImage src={video.editorAvatar} />
              <AvatarFallback>
                <Users className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{video.editorName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoCard;
