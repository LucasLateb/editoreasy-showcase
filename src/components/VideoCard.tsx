
import React, { useState } from 'react';
import { Video, Category, categories } from '@/types';
import { Eye, Heart, Play, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface VideoCardProps {
  video: Video;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const category = categories.find(c => c.id === video.categoryId);
  
  return (
    <div 
      className={cn(
        "group relative rounded-lg overflow-hidden aspect-video hover-scale cursor-pointer",
        video.isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Thumbnail */}
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80"></div>
      
      {/* Pro badge if editor is pro */}
      {video.editorTier === 'pro' && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-amber-500 text-white font-semibold">
            PRO
          </Badge>
        </div>
      )}
      
      {/* Highlight indicator */}
      {video.isHighlighted && (
        <div className="absolute top-2 left-2 z-10">
          <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-primary text-white text-xs">
            <Star className="h-3 w-3" fill="currentColor" />
            <span>Highlighted</span>
          </div>
        </div>
      )}
      
      {/* Play button that appears on hover */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
        isHovering ? "opacity-100" : "opacity-0"
      )}>
        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          <Play className="h-8 w-8 text-white" fill="white" />
        </div>
      </div>
      
      {/* Video info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {category && (
          <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-primary/20 backdrop-blur-sm text-primary-foreground">
            {category.name}
          </span>
        )}
        <h3 className="font-medium text-white mb-1 line-clamp-1">{video.title}</h3>
        
        {/* Editor info if available */}
        {video.editorName && (
          <div className="flex items-center mb-2">
            <div className="w-5 h-5 rounded-full bg-accent mr-2 overflow-hidden">
              {video.editorAvatar ? (
                <img src={video.editorAvatar} alt={video.editorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs text-primary-foreground">
                  {video.editorName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs text-white/80">{video.editorName}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-xs text-white/80">
          <div className="flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            <span>{video.views}</span>
          </div>
          <div className="flex items-center">
            <Heart className="h-3 w-3 mr-1" fill={video.likes > 50 ? "currentColor" : "none"} />
            <span>{video.likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
