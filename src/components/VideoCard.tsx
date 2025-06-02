
import React, { useState } from 'react';
import { Video, Category, categories } from '@/types';
import { Eye, Heart, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useVideoLikes } from '@/hooks/useLikes';
import { Image } from '@/components/ui/image';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovering, setIsHovering] = useState(false);
  const category = categories.find(c => c.id === video.categoryId);
  const { isLiked, likesCount, isLoading, toggleLike } = useVideoLikes(video.id, video.likes);
  
  return (
    <div 
      className={cn(
        "group relative rounded-xl overflow-hidden aspect-video cursor-pointer",
        "transition-all duration-500 ease-out transform-gpu",
        "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/25",
        "hover:-translate-y-2",
        video.isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Thumbnail */}
      <Image
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
      
      {/* Pro badge if editor is pro */}
      {video.editorTier === 'pro' && (
        <div className="absolute top-3 right-3 z-10 transition-transform duration-300 group-hover:scale-110">
          <Badge variant="default" className="bg-amber-500 text-white font-semibold shadow-lg">
            PRO
          </Badge>
        </div>
      )}
      
      {/* Highlight indicator */}
      {video.isHighlighted && (
        <div className="absolute top-3 left-3 z-10 transition-transform duration-300 group-hover:scale-110">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-primary text-white text-xs shadow-lg">
            <Star className="h-3 w-3" fill="currentColor" />
            <span>Highlighted</span>
          </div>
        </div>
      )}
      
      {/* Play button that appears on hover */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-all duration-500",
        isHovering ? "opacity-100 scale-100" : "opacity-0 scale-75"
      )}>
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 border border-white/30 shadow-2xl">
          <Play className="h-10 w-10 text-white drop-shadow-lg" fill="white" />
        </div>
      </div>
      
      {/* Video info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:translate-y-0">
        {category && (
          <span className="inline-block px-3 py-1 mb-3 text-xs font-medium rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105">
            {category.name}
          </span>
        )}
        <h3 className="font-semibold text-white mb-2 line-clamp-1 text-lg transition-all duration-300 group-hover:text-primary-foreground drop-shadow-lg">{video.title}</h3>
        
        {/* Editor info if available */}
        {video.editorName && (
          <div className="flex items-center mb-3 transition-transform duration-300 group-hover:translate-x-1">
            <div className="w-6 h-6 rounded-full bg-accent mr-2 overflow-hidden shadow-md">
              {video.editorAvatar ? (
                <Image src={video.editorAvatar} alt={video.editorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs text-primary-foreground">
                  {video.editorName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-sm text-white/90 font-medium drop-shadow-md">{video.editorName}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-6 text-sm text-white/90 transition-transform duration-300 group-hover:translate-x-1">
          <div className="flex items-center transition-colors duration-300 group-hover:text-white">
            <Eye className="h-4 w-4 mr-1.5 drop-shadow-md" />
            <span className="font-medium">{video.views}</span>
          </div>
          <div 
            className="flex items-center transition-all duration-300 hover:scale-110" 
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4 mr-1.5 transition-all duration-300 drop-shadow-md", 
                isLiked ? "text-red-500 scale-110" : "text-white/90",
                !isLoading && "hover:text-red-400 cursor-pointer hover:scale-125"
              )} 
              fill={isLiked ? "currentColor" : "none"} 
            />
            <span className="font-medium">{likesCount}</span>
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-t from-primary/5 to-transparent"></div>
    </div>
  );
};

export default VideoCard;
