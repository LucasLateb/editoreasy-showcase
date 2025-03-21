
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Star, Play, Mail, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { useToast } from '@/hooks/use-toast';

interface EditorCardProps {
  editor: User;
  index: number;
  showreelUrl?: string;
  showreelThumbnail?: string;
  about?: string;
}

const EditorCard: React.FC<EditorCardProps> = ({ 
  editor, 
  index, 
  showreelUrl, 
  showreelThumbnail,
  about 
}) => {
  const animationDelay = `${0.1 + index * 0.1}s`;
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const { toast } = useToast();
  
  // Extract video ID from YouTube URL for thumbnail as fallback
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const videoId = url.split('/').pop();
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  // Use the showreelThumbnail from the database if available, otherwise fall back to YouTube thumbnail
  const thumbnailUrl = showreelThumbnail || (showreelUrl ? getYouTubeThumbnail(showreelUrl) : null);

  // Decide which bio text to show - prefer the about from portfolio_settings, fallback to the bio from user profile
  const bioText = about || editor.bio || '';

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Contact Request Sent",
      description: `Your request to contact ${editor.name} has been sent.`,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a share URL for this editor
    const shareUrl = `${window.location.origin}/editor/${editor.id}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: `${editor.name} - Video Editor Profile`,
        url: shareUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    });
  };

  return (
    <>
      <div 
        className="relative group p-5 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in opacity-0 hover-scale"
        style={{ animationDelay }}
      >
        <div className="absolute -top-3 -right-1">
          <Badge variant={editor.subscriptionTier === 'pro' ? 'default' : 'outline'} className="shadow-sm">
            {editor.subscriptionTier === 'pro' ? 'PRO' : editor.subscriptionTier.charAt(0).toUpperCase() + editor.subscriptionTier.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow">
            <AvatarImage src={editor.avatarUrl} alt={editor.name} />
            <AvatarFallback>{editor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium">{editor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {editor.subscriptionTier === 'pro' && (
                <span className="inline-flex items-center mr-1">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                </span>
              )}
              Joined {editor.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {bioText && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{bioText}</p>
        )}
        
        {(showreelUrl && thumbnailUrl) && (
          <div 
            className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-black/5 cursor-pointer group/video" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVideoPlayerOpen(true);
            }}
          >
            <div className="w-full h-full relative">
              <img 
                src={thumbnailUrl}
                alt={`${editor.name}'s showreel`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform scale-90 group-hover/video:scale-100 transition-transform">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Heart className={cn(
              "h-4 w-4 mr-1",
              editor.likes > 400 ? "text-red-500" : "text-muted-foreground"
            )} fill={editor.likes > 400 ? "currentColor" : "none"} />
            <span>{editor.likes} likes</span>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 py-1 h-8 relative z-20"
              onClick={handleContact}
            >
              <Mail className="h-4 w-4 mr-1" />
              <span className="text-xs">Contact</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 py-1 h-8 relative z-20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
        
        <Link to={`/editor/${editor.id}`} className="absolute inset-0 z-10" aria-label={`View ${editor.name}'s profile`}></Link>
        
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary"></div>
        </div>
      </div>
      
      {/* Video Player Dialog */}
      {showreelUrl && (
        <VideoPlayerDialog
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
          videoUrl={showreelUrl}
          title={`${editor.name}'s Showreel`}
        />
      )}
    </>
  );
};

export default EditorCard;
