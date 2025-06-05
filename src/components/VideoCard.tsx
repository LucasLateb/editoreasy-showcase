
import React, { useState, useRef, useEffect } from 'react';
import { Video } from '@/types';
import { Eye, Heart, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useVideoLikes } from '@/hooks/useLikes';
import { Image } from '@/components/ui/image';
import { Card } from '@/components/ui/card';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';

interface VideoCardProps {
  video: Video;
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Helper function to check if URL is Vimeo
const isVimeoUrl = (url: string): boolean => {
  return url.includes('vimeo.com');
};

// Helper function to check if URL is TikTok
const isTikTokUrl = (url: string): boolean => {
  return url.includes('tiktok.com');
};

// Helper function to extract TikTok embed code
const getTikTokEmbedCode = (url: string): string | null => {
  // Si c'est déjà du code d'intégration, le retourner
  if (url.includes('<blockquote') && url.includes('tiktok-embed')) {
    return url;
  }
  
  // Si c'est un lien TikTok, essayer d'extraire l'ID
  const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
  if (match) {
    const videoId = match[1];
    return `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@user/video/${videoId}" data-video-id="${videoId}" style="max-width: 605px;min-width: 325px;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
  }
  
  return null;
};

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use the fallback hook to get categories
  const { categories } = useCategoriesWithFallback();
  
  // Find category by ID - now using the categories from the hook
  const category = categories.find(cat => cat.id === video.categoryId);
  
  const { isLiked, likesCount, isLoading, toggleLike } = useVideoLikes(video.id, video.likes);
  
  // Check video types
  const youtubeVideoId = getYouTubeVideoId(video.videoUrl);
  const isYoutube = !!youtubeVideoId;
  const isVimeo = isVimeoUrl(video.videoUrl);
  const isTikTok = isTikTokUrl(video.videoUrl);
  const tikTokEmbedCode = isTikTok ? getTikTokEmbedCode(video.videoUrl) : null;
  
  console.log('VideoCard - video.categoryId:', video.categoryId);
  console.log('VideoCard - found category:', category);
  console.log('VideoCard - available categories:', categories);
  console.log('VideoCard - YouTube video ID:', youtubeVideoId);
  console.log('VideoCard - Is YouTube:', isYoutube);
  console.log('VideoCard - Is TikTok:', isTikTok);
  
  // Intersection Observer to detect when video enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.5,
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
        // Format vertical pour TikTok
        isTikTok ? "aspect-[9/16] max-w-[280px]" : "aspect-video"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={cn(
        "video-card relative", 
        isTikTok ? "aspect-[9/16]" : "aspect-video"
      )}>
        {/* Video Content - YouTube autoplay, TikTok embed, or regular thumbnail */}
        {isYoutube && isInView ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
            className="w-full h-full object-cover"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : isTikTok && tikTokEmbedCode && isInView ? (
          <div 
            className="w-full h-full flex items-center justify-center bg-black"
            dangerouslySetInnerHTML={{ __html: tikTokEmbedCode }}
          />
        ) : (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        )}
        
        {/* Overlay gradient - only show on non-YouTube/TikTok or when not in view */}
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
        
        {/* TikTok indicator */}
        {isTikTok && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="text-white">♪</span>
              TikTok
            </div>
          </div>
        )}
        
        {/* Play button that appears on hover - only for non-YouTube/TikTok or when not in view */}
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
        
        {/* Video content overlay - only show on non-YouTube/TikTok or when not in view */}
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
