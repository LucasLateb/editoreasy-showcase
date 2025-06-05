import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/types';
import { Eye, Heart, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useVideoLikes } from '@/hooks/useLikes';
import { Image } from '@/components/ui/image';
import { Card } from '@/components/ui/card';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';
import { getYouTubeVideoId, isVimeoUrl, isTikTokEmbed, getVideoAspectRatio, isYouTubeShorts } from '@/utils/videoHelpers';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use the fallback hook to get categories
  const { categories } = useCategoriesWithFallback();
  
  // Find category by ID - now using the categories from the hook
  const category = categories.find(cat => cat.id === video.categoryId);
  
  const { isLiked, likesCount, isLoading, toggleLike } = useVideoLikes(video.id, video.likes);
  
  // Check video platform types
  const youtubeVideoId = getYouTubeVideoId(video.videoUrl);
  const isYoutube = !!youtubeVideoId;
  const isYoutubeShorts = isYouTubeShorts(video.videoUrl);
  const isVimeo = isVimeoUrl(video.videoUrl);
  const isTikTok = isTikTokEmbed(video.videoUrl);
  const videoAspectRatio = getVideoAspectRatio(video.videoUrl);
  const isVertical = videoAspectRatio === 'vertical';
  
  console.log('VideoCard - video.categoryId:', video.categoryId);
  console.log('VideoCard - found category:', category);
  console.log('VideoCard - available categories:', categories);
  console.log('VideoCard - YouTube video ID:', youtubeVideoId);
  console.log('VideoCard - Is YouTube:', isYoutube);
  console.log('VideoCard - Is YouTube Shorts:', isYoutubeShorts);
  console.log('VideoCard - Is TikTok:', isTikTok);
  console.log('VideoCard - Is Vertical:', isVertical);
  
  // Intersection Observer to detect when video enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.5, // Trigger when 50% of the video is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  return (
    <Card 
      ref={cardRef}
      className={cn(
        "overflow-hidden border-0 shadow-lg transition-all duration-500 ease-out transform-gpu cursor-pointer",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/25 hover:-translate-y-2",
        video.isHighlighted && "rounded-xl",
        isVertical ? "max-w-[260px] mx-auto" : "w-full max-w-[480px]"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={cn(
        "video-card relative",
        isVertical ? "aspect-[9/16]" : "aspect-[16/10]"
      )}>
        {/* Video Content - Check if we can autoplay or show thumbnail */}
        {isYoutube && isInView ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isTikTok && isInView ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: video.videoUrl }}
          />
        ) : (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Overlay gradient - only show on non-embedded videos or when not in view */}
        {((!isYoutube && !isTikTok) || !isInView) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80"></div>
        )}
        
        {/* Pro badge if editor is pro */}
        {video.editorTier === 'pro' && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="default" className="bg-amber-500 text-white font-semibold shadow-lg">
              PRO
            </Badge>
          </div>
        )}
        
        {/* Highlight indicator */}
        {video.isHighlighted && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-brand-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              En vedette
            </div>
          </div>
        )}
        
        {/* Platform indicators for vertical videos */}
        {isTikTok && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              TikTok
            </div>
          </div>
        )}
        
        {isYoutubeShorts && (
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-red-600/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
              Shorts
            </div>
          </div>
        )}
        
        {/* Play button that appears on hover - only for non-embedded or when not in view */}
        {((!isYoutube && !isTikTok) || !isInView) && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovering ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl">
              <Play className="h-8 w-8 text-white drop-shadow-lg" fill="white" />
            </div>
          </div>
        )}
        
        {/* Video content overlay - only show on non-embedded or when not in view */}
        {((!isYoutube && !isTikTok) || !isInView) && (
          <div className="video-card-content absolute bottom-0 left-0 right-0 p-4">
            {/* Video title - only on hover */}
            <div className={cn(
              "transition-all duration-300 mb-3",
              isHovering ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}>
              <h3 className="font-medium text-base line-clamp-1 text-white drop-shadow-lg">{video.title}</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Editor info */}
                {video.editorName && (
                  <>
                    <div className="w-6 h-6 rounded-full bg-accent overflow-hidden shadow-md">
                      {video.editorAvatar ? (
                        <Image src={video.editorAvatar} alt={video.editorName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs text-primary-foreground">
                          {video.editorName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white/90 font-medium drop-shadow-md">{video.editorName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Stats section */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Eye className="h-3 w-3 mr-1" />
            <span>{video.views}</span>
          </div>
          <div 
            className="flex items-center text-xs cursor-pointer transition-all duration-300 hover:scale-110" 
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
          >
            <Heart 
              className={cn(
                "h-3 w-3 mr-1 transition-all duration-300", 
                isLiked ? "text-red-500 scale-110" : "text-muted-foreground",
                !isLoading && "hover:text-red-400"
              )} 
              fill={isLiked ? "currentColor" : "none"} 
            />
            <span className={cn(isLiked ? "text-red-500" : "text-muted-foreground")}>{likesCount}</span>
          </div>
        </div>
        {/* Category info in stats - Always show if available */}
        {category && (
          <div className="text-xs text-muted-foreground font-medium">
            {category.name}
          </div>
        )}
      </div>
    </Card>
  );
};

export default VideoCard;
