
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Star, Play, Mail, Share2, Briefcase, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { useToast } from '@/components/ui/use-toast'; // Shadcn toast
import { toast as sonnerToast } from 'sonner'; // Sonner toast
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateConversation } from '@/lib/messagingUtils';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Added Card, CardContent, CardFooter
import { useProfileLikes } from '@/hooks/useLikes'; // Added useProfileLikes

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
  const { toast: shadcnOriginalToast } = useToast(); // Original shadcn toast
  const { toast } = useToast();
  const { isLiked, likesCount, isLoading, toggleLike } = useProfileLikes(editor.id, editor.likes);
  
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const videoId = url.split('/').pop();
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const thumbnailUrl = showreelThumbnail || (showreelUrl ? getYouTubeThumbnail(showreelUrl) : null);

  const bioText = about || editor.bio || '';

  // Use avatar as cover if no specific cover image
  const coverImage = editor.avatarUrl || '/placeholder.svg';

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
      // Optionally, pass conversationId to pre-select it on the messaging tab
      // navigate(`/dashboard?tab=messaging&conversationId=${conversationId}`);
    } else {
      // Error toast is handled by getOrCreateConversation
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
          "relative group h-full opacity-0 hover:border-primary/50 transition-all duration-300 animate-fade-in hover-scale overflow-hidden border",
          specializations.length > 0 ? "min-h-[400px]" : "min-h-[350px]"
        )}
        style={{ animationDelay }}
      >
        {/* Cover Section with Gradient Overlay */}
        <div className="aspect-[3/1] relative overflow-hidden">
          <img 
            src={coverImage} 
            alt={`Cover of ${editor.name}`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          
          {/* Badge positioned on cover */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant={editor.subscriptionTier === 'pro' ? 'default' : 'outline'} 
              className="shadow-sm bg-white/90 text-black"
            >
              {formatSubscriptionTier(editor.subscriptionTier)}
            </Badge>
          </div>
          
          {/* Avatar and Name over cover */}
          <div className="absolute bottom-0 left-0 w-full p-4 flex justify-between items-end">
            <div className="flex items-center">
              <Avatar className="h-12 w-12 border-2 border-white shadow mr-3">
                <AvatarImage src={editor.avatarUrl} alt={editor.name} />
                <AvatarFallback>{editor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-white">{editor.name}</h3>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  {editor.subscriptionTier === 'pro' && (
                    <span className="inline-flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                    </span>
                  )}
                  <span>Joined {editor.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          {bioText && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{bioText}</p>
          )}
          
          {specializations && specializations.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Specializations</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {specializations.slice(0, 3).map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {specializations.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{specializations.length - 3}
                  </Badge>
                )}
              </div>
            </div>
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
          
          <div 
            className="flex items-center text-sm text-muted-foreground mb-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleLike();
            }}
          >
            <Heart 
              className={cn(
                "h-4 w-4 mr-1 transition-colors",
                isLiked ? "text-red-500" : "text-muted-foreground",
                !isLoading && "hover:text-red-400 cursor-pointer"
              )} 
              fill={isLiked ? "currentColor" : "none"} 
            />
            {editor.totalVideoLikes !== undefined && (
              <span className="flex items-center gap-1">
                {editor.totalVideoLikes}
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 justify-between items-center">
          <div className="flex space-x-2 w-full">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 flex-1" 
              size="sm"
              asChild
            >
              <Link to={`/editor/${editor.id}`}>
                View Portfolio
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 relative z-20"
              onClick={handleContact}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 relative z-20"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
        
        <Link to={`/editor/${editor.id}`} className="absolute inset-0 z-10" aria-label={`View ${editor.name}'s profile`}></Link>
        
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary"></div>
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
