
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Mail, User, Briefcase, Edit, X, PlusCircle, Film, Heart, Bookmark } from 'lucide-react';
import { useProfileLikes } from '@/hooks/useLikes';
import { useEditorFavorites } from '@/hooks/useEditorFavorites';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation } from '@/lib/messagingUtils';
import { toast } from 'sonner';

interface ProfileCardProps {
  currentUser: any;
  about: string;
  setAbout: (value: string) => void;
  specializations: string[];
  setSpecializations: (specializations: string[]) => void;
  newSpecialization: string;
  setNewSpecialization: (value: string) => void;
  editMode: boolean;
  aboutDialogOpen: boolean;
  setAboutDialogOpen: (open: boolean) => void;
  specializationsDialogOpen: boolean;
  setSpecializationsDialogOpen: (open: boolean) => void;
  handleAddSpecialization: () => void;
  handleRemoveSpecialization: (index: number) => void;
  isViewOnly?: boolean;
  editorData?: any;
  totalVideos?: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  currentUser,
  about,
  setAbout,
  specializations,
  setSpecializations,
  newSpecialization,
  setNewSpecialization,
  editMode,
  aboutDialogOpen,
  setAboutDialogOpen,
  specializationsDialogOpen,
  setSpecializationsDialogOpen,
  handleAddSpecialization,
  handleRemoveSpecialization,
  isViewOnly = false,
  editorData,
  totalVideos = 0
}) => {
  const displayUser = isViewOnly ? editorData : currentUser;
  const userId = displayUser?.id;
  const { currentUser: authUser } = useAuth();
  const navigate = useNavigate();
  
  const { isLiked, likesCount, isLoading, toggleLike } = useProfileLikes(userId || '', displayUser?.likes || 0);
  const { isFavorited, isLoading: isFavLoading, toggleFavorite } = useEditorFavorites(isViewOnly ? userId : undefined);
  
  const totalVideoLikes = displayUser?.totalVideoLikes || 0;
  const isClient = authUser?.role === 'client';
  
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
  
  const handleContactEditor = async () => {
    if (!authUser) {
      toast.error('You must be logged in to contact an editor.');
      navigate('/login');
      return;
    }
    if (!displayUser || !displayUser.id) {
      toast.error('Editor information is missing.');
      return;
    }

    toast.info('Starting conversation...');
    const conversationId = await getOrCreateConversation(authUser.id, displayUser.id);

    if (conversationId) {
      toast.success(`Conversation with ${displayUser.name} started! Redirecting...`);
      navigate('/dashboard?tab=messaging');
    }
  };
  
  return (
    <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
      {/* Profile information with consistent avatar display */}
      <div className="flex items-center mb-6">
        <Avatar className="h-16 w-16 mr-4 border-2 border-background shadow-sm">
          <AvatarImage 
            src={displayUser?.avatar_url || displayUser?.avatarUrl} 
            alt={displayUser?.name || 'Editor'} 
          />
          <AvatarFallback className="text-lg">
            {displayUser?.name?.charAt(0) || 'E'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-medium">{displayUser?.name || 'Video Editor'}</h2>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="mr-2">
              {formatSubscriptionTier(displayUser?.subscriptionTier || displayUser?.subscription_tier)}
            </Badge>
            <div className="flex items-center">
              <span className="text-sm flex items-center text-muted-foreground">
                <Heart 
                  className={cn(
                    "h-4 w-4 mr-1 transition-colors",
                    isLiked ? "text-red-500" : "text-muted-foreground"
                  )} 
                  fill={isLiked ? "currentColor" : "none"} 
                />
                <span>{likesCount}</span>
              </span>
            </div>
            <span className="text-sm text-muted-foreground ml-2 pl-2 border-l border-border flex items-center">
              <Film className="h-4 w-4 mr-1 text-muted-foreground" /> {totalVideos}
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border pt-6">
        {/* About section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              About
            </h3>
            {editMode && (
              <Dialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit About</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Textarea 
                      value={about} 
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Tell others about yourself and your work..."
                      className="min-h-[150px]"
                    />
                    <div className="flex justify-end">
                      <Button onClick={() => setAboutDialogOpen(false)}>Save</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{about || "No information provided."}</p>
        </div>
        
        {/* Specializations section */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center">
            <Briefcase className="h-4 w-4 mr-2" />
            Specializations
          </h3>
          {editMode && (
            <Dialog open={specializationsDialogOpen} onOpenChange={setSpecializationsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Specializations</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Specializations</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 flex items-center gap-1">
                          {spec}
                          <button 
                            onClick={() => handleRemoveSpecialization(index)} 
                            className="ml-1 rounded-full hover:bg-background/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Add new specialization"
                      className="flex-1"
                    />
                    <Button onClick={handleAddSpecialization} type="button">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setSpecializationsDialogOpen(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {specializations.map((spec, index) => (
            <Badge key={index} variant="secondary">{spec}</Badge>
          ))}
          {(specializations.length === 0 && !editMode) && (
            <p className="text-sm text-muted-foreground">No specializations listed.</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleContactEditor} disabled={displayUser?.id === authUser?.id}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Me
          </Button>

          {isViewOnly && (
            <Button
              variant={isLiked ? "outline" : "default"}
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLike();
              }}
              disabled={isLoading}
            >
              <Heart
                className={cn("mr-2 h-4 w-4", isLiked && "text-red-500")}
                fill={isLiked ? "currentColor" : "none"}
              />
              {isLiked ? "Unlike Portfolio" : "Like this Portfolio"}
            </Button>
          )}
          
          {isViewOnly && isClient && (
            <Button 
              variant={isFavorited ? "outline" : "secondary"} 
              className="w-full" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite();
              }}
              disabled={isFavLoading}
            >
              <Bookmark 
                className={cn("mr-2 h-4 w-4", isFavorited && "text-primary")} 
                fill={isFavorited ? "currentColor" : "none"} 
              />
              {isFavorited ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
