
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Star, Play, Mail, Share2, Briefcase, Film, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateConversation } from '@/lib/messagingUtils';
import { Card, CardContent } from '@/components/ui/card';
import { useProfileLikes } from '@/hooks/useLikes';

interface EditorCardProps {
  editor: User & {
    totalVideoLikes?: number;
  };
  index: number;
  showreelUrl?: string;
  showreelThumbnail?: string;
  about?: string;
  specializations?: string[];
}

const EditorCard: React.FC<EditorCardProps> = ({ 
  editor, 
  index, 
  showreelUrl, 
  showreelThumbnail,
  about,
  specializations = []
}) => {
  const animationDelay = `${0.1 + index * 0.1}s`;
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { isLiked, likesCount, isLoading, toggleLike } = useProfileLikes(editor.id, editor.likes);
  
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const videoId = url.split('/').pop();
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const thumbnailUrl = showreelThumbnail || (showreelUrl ? getYouTubeThumbnail(showreelUrl) : null);
  const bioText = about || editor.bio || '';

  const formatSubscriptionTier = (tier: string) => {
    if (!tier) return 'Free';
    if (tier === 'free' || tier === 'premium' || tier === 'pro') {
      return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
    if (tier.toLowerCase() === 'free') return 'Free';
    if (tier.toLowerCase() === 'premium') return 'Premium';
    if (tier.toLowerCase() === 'pro') return 'Pro';
    return 'Free';
  };

  const handleContact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      sonnerToast.error('You must be logged in to contact an editor.');
      navigate('/login');
      return;
    }
    if (!editor || !editor.id) {
        sonnerToast.error('Editor information is missing.');
        return;
    }

    sonnerToast.info('Starting conversation...');
    const conversationId = await getOrCreateConversation(currentUser.id, editor.id);

    if (conversationId) {
      sonnerToast.success(`Conversation with ${editor.name} started! Redirecting...`);
      navigate('/dashboard?tab=messaging');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/editor/${editor.id}`;
    
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
      <Card 
        className={cn(
          "relative group h-full opacity-0 transition-all duration-500 ease-out animate-fade-in",
          "hover:shadow-2xl hover:-translate-y-2 hover:shadow-primary/10",
          "transform-gpu will-change-transform overflow-hidden",
          "border border-border/50 hover:border-primary/30"
        )}
        style={{ animationDelay }}
      >
        {/* Header avec badge tier */}
        <div className="absolute top-4 right-4 z-20">
          <Badge 
            variant={editor.subscriptionTier === 'pro' ? 'default' : editor.subscriptionTier === 'premium' ? 'secondary' : 'outline'} 
            className="shadow-sm transition-all duration-300 group-hover:shadow-md font-medium"
          >
            {formatSubscriptionTier(editor.subscriptionTier)}
          </Badge>
        </div>

        <CardContent className="p-0">
          {/* Section Info */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-3 border-background shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <AvatarImage src={editor.avatarUrl} alt={editor.name} />
                <AvatarFallback className="text-lg font-medium">{editor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold transition-colors duration-300 group-hover:text-primary truncate">
                  {editor.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {editor.subscriptionTier === 'pro' && (
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  )}
                  <span>Joined {editor.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Showreel Thumbnail */}
          {(showreelUrl && thumbnailUrl) && (
            <div className="px-6 pb-4">
              <div 
                className="w-full aspect-video rounded-xl overflow-hidden bg-black/5 cursor-pointer group/video transition-all duration-300 hover:shadow-lg" 
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
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/video:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/video:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform scale-90 group-hover/video:scale-100 transition-transform">
                      <Play className="h-7 w-7 text-primary fill-primary ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs">
                      <Film className="h-3 w-3 mr-1" />
                      Showreel
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Section About */}
          {bioText && (
            <div className="px-6 pb-4">
              <h4 className="text-sm font-medium mb-2 text-foreground">About</h4>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{bioText}</p>
            </div>
          )}
          
          {/* Section Specializations */}
          {specializations && specializations.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">Specializations</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {specializations.slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2 py-1 transition-all duration-300 group-hover:bg-primary/10">
                    {spec}
                  </Badge>
                ))}
                {specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{specializations.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Section Stats */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-6">
                <div 
                  className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike();
                  }}
                >
                  <Heart 
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isLiked ? "text-red-500 scale-110" : "text-muted-foreground",
                      !isLoading && "hover:text-red-400"
                    )} 
                    fill={isLiked ? "currentColor" : "none"} 
                  />
                  <span className={cn("text-sm font-medium", isLiked ? "text-red-500" : "text-muted-foreground")}>
                    {likesCount}
                  </span>
                </div>
                
                {editor.totalVideoLikes !== undefined && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {editor.totalVideoLikes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Section Buttons */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="h-9 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
                asChild
              >
                <Link to={`/editor/${editor.id}`} className="flex items-center gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Portfolio
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={handleContact}
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                Contact
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
                onClick={handleShare}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Gradient border animation */}
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </div>
      </Card>
      
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
