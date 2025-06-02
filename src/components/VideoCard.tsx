
import React from 'react';
import { Video } from '@/types';
import { Eye, Heart, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';

interface VideoCardProps {
  video: Video & {
    editorName?: string;
    editorAvatar?: string;
    editorTier?: string;
  };
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { getCategoryById } = useCategoriesWithFallback();
  const category = getCategoryById(video.categoryId);

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary rounded-full p-3">
              <Play className="h-6 w-6 text-primary-foreground" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {video.description}
          </p>
        )}
        
        {video.editorName && (
          <div className="flex items-center mb-3">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={video.editorAvatar} />
              <AvatarFallback className="text-xs">
                {video.editorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {video.editorName}
              {video.editorTier === 'pro' && (
                <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium">
                  PRO
                </span>
              )}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{video.views}</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              <span>{video.likes}</span>
            </div>
          </div>
          
          {category && (
            <span className="text-xs text-muted-foreground">
              {category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
