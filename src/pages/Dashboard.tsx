import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Video, categories, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, UploadCloud, Film, Play, MessageSquare, BarChart3, CreditCard, User as UserIcon, Heart, Video as VideoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import VideoUploadDialog, { UploadFormData } from '@/components/dashboard/VideoUploadDialog';
import VideosTab from '@/components/dashboard/VideosTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import AccountTab from '@/components/dashboard/AccountTab';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import MessagingTab from '@/components/dashboard/MessagingTab';
import PlanTab from '@/components/dashboard/PlanTab';
import FavoriteEditorsTab from '@/components/dashboard/FavoriteEditorsTab';
import NotificationDot from '@/components/ui/NotificationDot';
import LimitReachedDialog from '@/components/dashboard/LimitReachedDialog';

interface ShowreelTabProps {
  videos: Video[];
  isLoading: boolean;
  onSetShowreel: (videoUrl: string, thumbnailUrl?: string) => void;
  currentShowreelUrl: string | null;
  currentShowreelThumbnail: string | null;
}

const ShowreelTab: React.FC<ShowreelTabProps> = ({ 
  videos: localVideos, 
  isLoading: localIsLoading, 
  onSetShowreel,
  currentShowreelUrl: localCurrentShowreelUrl,
  currentShowreelThumbnail: localCurrentShowreelThumbnail
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [videoToConfirm, setVideoToConfirm] = useState<Video | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const { toast: localToast } = useToast();
  
  const handleSelectShowreel = (video: Video) => {
    setVideoToConfirm(video);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmShowreel = () => {
    if (videoToConfirm) {
      try {
        if (videoToConfirm.videoUrl.includes('<iframe')) {
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else if (videoToConfirm.videoUrl.startsWith('http://') || videoToConfirm.videoUrl.startsWith('https://')) {
          new URL(videoToConfirm.videoUrl);
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else {
          throw new Error('Invalid URL format');
        }
        
        setSelectedVideo(videoToConfirm);
        localToast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
      } catch (error) {
        console.error("Invalid video URL:", error);
        localToast({
          title: "Invalid URL",
          description: "The selected video has an invalid URL format.",
          variant: "destructive"
        });
      }
    }
    setConfirmDialogOpen(false);
    setVideoToConfirm(null);
  };
  
  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      try {
        if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://') && !customUrl.includes('<iframe')) {
          throw new Error('URL must start with http:// or https:// or be an iframe embed code');
        }
        
        onSetShowreel(customUrl.trim(), customThumbnailUrl || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81');
        localToast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
      } catch (error) {
        console.error("Invalid custom URL:", error);
        localToast({
          title: "Invalid URL",
          description: error instanceof Error ? error.message : "The URL format is invalid.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePlayClick = () => {
    setShowVideo(true);
  };
  
  if (localIsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const isEmbedCode = localCurrentShowreelUrl && localCurrentShowreelUrl.includes('<iframe');
  const extractSrcFromEmbed = (embedCode: string) => {
    try {
      const srcMatch = embedCode.match(/src="([^"]+)"/);
      return srcMatch && srcMatch[1] ? srcMatch[1] : '';
    } catch (error) {
      console.error('Error extracting src from embed code:', error);
      return '';
    }
  };
  
  let displayUrl = '';
  if (isEmbedCode && localCurrentShowreelUrl) {
    displayUrl = extractSrcFromEmbed(localCurrentShowreelUrl);
  } else if (localCurrentShowreelUrl) {
    displayUrl = localCurrentShowreelUrl;
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Current Showreel</h2>
        {localCurrentShowreelUrl ? (
          <div className="aspect-video relative mb-4">
            <div className="relative w-full h-full">
              <img 
                src={localCurrentShowreelThumbnail || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81'} 
                alt="Showreel thumbnail" 
                className="w-full h-full object-cover border rounded-md cursor-pointer"
                onClick={() => setVideoPlayerOpen(true)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer"
                  onClick={() => setVideoPlayerOpen(true)}
                >
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-secondary aspect-video rounded-md mb-4">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No showreel set</p>
          </div>
        )}
      </div>
      
      {localCurrentShowreelUrl && (
        <VideoPlayerDialog
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
          videoUrl={localCurrentShowreelUrl}
          title="My Showreel"
        />
      )}
  
{localVideos.length > 0 && (
        <div className="bg-background p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select from Your Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localVideos.map((video) => (
              <div 
                key={video.id} 
                className={`relative cursor-pointer border rounded-md overflow-hidden ${selectedVideo?.id === video.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelectShowreel(video)}
              >
                <div className="aspect-video">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 bg-background">
                  <h3 className="font-medium text-sm truncate">{video.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Set Custom Showreel URL</h2>
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={customUrl} 
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/your-video-id"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <Button onClick={handleCustomUrlSubmit} disabled={!customUrl.trim()}>
            Set as Showreel
          </Button>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Custom Thumbnail URL (optional)</label>
          <input 
            type="text" 
            value={customThumbnailUrl} 
            onChange={(e) => setCustomThumbnailUrl(e.target.value)}
            placeholder="https://example.com/your-thumbnail-image.jpg"
            className="w-full px-3 py-2 border rounded-md"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Leave empty to use a default thumbnail
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Use an embed URL from YouTube or Vimeo for best results.
        </p>
      </div>
      
      <ConfirmationDialog
        isOpen={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmShowreel}
        title="Set as Showreel"
        description={`Are you sure you want to set "${videoToConfirm?.title}" as your showreel? This will replace your current showreel and be visible on your portfolio page.`}
        confirmLabel="Set as Showreel"
        cancelLabel="Cancel"
      />
    </div>
  );
};

const VIDEO_LIMITS = {
  free: 3,
  basic: 15, // 'basic_tier_plan_id' sera mappé à 'premium' pour l'utilisateur
  premium: 15, // Explicitement pour correspondre au discours utilisateur
  pro: Infinity, // 'pro_tier_plan_id'
};

const TIER_NAMES_MAP: { [key: string]: string } = {
  free: 'Gratuit',
  basic_tier_plan_id: 'Premium', // Mapping technique vers nom utilisateur
  premium: 'Premium',
  pro_tier_plan_id: 'Pro',
  pro: 'Pro',
};

// Helper pour obtenir le nom lisible du tier et sa limite
const getTierDetails = (tierId?: string | null) => {
  // Ensure tierId is one of the expected values 'free', 'premium', 'pro'
  // The currentUser.subscriptionTier will be one of these.
  // The current logic handles if tierId might be a more complex string like 'basic_tier_plan_id'
  // but for currentUser.subscriptionTier, it's simpler.
  let normalizedTierKey: 'free' | 'premium' | 'pro' = 'free';
  if (tierId === 'premium') {
    normalizedTierKey = 'premium';
  } else if (tierId === 'pro') {
    normalizedTierKey = 'pro';
  } else if (tierId === 'free') {
    normalizedTierKey = 'free';
  }
  // Fallback for unexpected tierId values, though currentUser.subscriptionTier should be constrained
  const validTierIdForMap = tierId && TIER_NAMES_MAP[tierId] ? tierId : normalizedTierKey;

  const limit = VIDEO_LIMITS[normalizedTierKey as keyof typeof VIDEO_LIMITS] || VIDEO_LIMITS.free;
  // Use normalizedTierKey for TIER_NAMES_MAP lookup if direct tierId isn't found or to ensure consistency
  const name = TIER_NAMES_MAP[validTierIdForMap as keyof typeof TIER_NAMES_MAP] || TIER_NAMES_MAP[normalizedTierKey] || 'Gratuit';
  
  return { limit, name, key: normalizedTierKey };
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [limitReachedDialogOpen, setLimitReachedDialogOpen] = useState(false);
  
  // Initialize with default free tier details, will be updated in useEffect
  const [currentVideoLimit, setCurrentVideoLimit] = useState(VIDEO_LIMITS.free);
  const [currentTierName, setCurrentTierName] = useState(TIER_NAMES_MAP.free);

  const [currentShowreelUrl, setCurrentShowreelUrl] = useState<string | null>(null);
  const [currentShowreelThumbnail, setCurrentShowreelThumbnail] = useState<string | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  const searchParams = new URLSearchParams(location.search);
  const activeTabFromUrl = searchParams.get('tab');
  const isClient = currentUser?.role === 'client';
  
  const defaultTab = activeTabFromUrl || (isClient ? 'messaging' : 'videos');
  
  useEffect(() => {
    if (currentUser) {
      // Mettre à jour les détails du plan lorsque currentUser change
      const tierDetails = getTierDetails(currentUser.subscriptionTier); // Changed to subscriptionTier
      setCurrentVideoLimit(tierDetails.limit);
      setCurrentTierName(tierDetails.name);

      if (!isClient) {
        Promise.all([
          fetchUserVideos(),
          fetchPortfolioSettings(),
          fetchCategories()
        ]);
      } else {
        fetchPortfolioSettings();
        fetchCategories();
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isClient]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static categories if database fetch fails
      setCategories([
        { id: '1', name: 'Animation' },
        { id: '2', name: 'Commercial' },
        { id: '3', name: 'Documentary' },
        { id: '4', name: 'Music Video' },
        { id: '5', name: 'Short Film' },
      ]);
    }
  };
  
  const fetchPortfolioSettings = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('portfolio_settings')
        .select('showreel_url, showreel_thumbnail')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setCurrentShowreelUrl(data.showreel_url);
        setCurrentShowreelThumbnail(data.showreel_thumbnail);
        console.log('Loaded showreel settings:', { url: data.showreel_url, thumbnail: data.showreel_thumbnail });
      }
    } catch (error) {
      console.error('Error fetching portfolio settings:', error);
      // Do not toast here for client role, as it might be confusing.
      // Only toast for editor role if it fails.
      if (!isClient) {
        toast({
          title: "Error loading showreel",
          description: "There was a problem loading your showreel settings.",
          variant: "destructive"
        });
      }
    }
  };
  
  const fetchUserVideos = async () => {
    if (!currentUser?.id) return; 
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUser.id) 
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedVideos: Video[] = data.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        thumbnailUrl: video.thumbnail_url || `https://images.unsplash.com/photo-${1550745165 + Math.floor(Math.random() * 100)}-9bc0b252726f`,
        videoUrl: video.video_url || '#',
        categoryId: video.category_id,
        userId: video.user_id,
        likes: video.likes || 0,
        views: video.views || 0,
        createdAt: new Date(video.created_at),
        isHighlighted: video.is_highlighted
      }));
      
      setVideos(formattedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Failed to load videos",
        description: "There was an error loading your videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetShowreel = async (url: string, thumbnailUrl?: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to update your showreel.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert({
          user_id: currentUser.id,
          showreel_url: url,
          showreel_thumbnail: thumbnailUrl || currentShowreelThumbnail || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setCurrentShowreelUrl(url);
      setCurrentShowreelThumbnail(thumbnailUrl || currentShowreelThumbnail);
      
      console.log('Showreel updated:', { url, thumbnail: thumbnailUrl || currentShowreelThumbnail });
      
      toast({
        title: "Showreel updated",
        description: "Your showreel has been updated successfully and will be displayed on your portfolio page.",
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating showreel:', error);
      toast({
        title: "Failed to update showreel",
        description: "There was an error updating your showreel. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUploadVideo = () => {
    if (!currentUser) {
        toast({ title: "Erreur d'authentification", description: "Vous devez être connecté.", variant: "destructive"});
        return;
    }

    // Use currentUser.subscriptionTier which is of type 'free' | 'premium' | 'pro'
    const userTierKey = getTierDetails(currentUser.subscriptionTier).key; // Changed to subscriptionTier
    const limit = VIDEO_LIMITS[userTierKey as keyof typeof VIDEO_LIMITS] || VIDEO_LIMITS.free;

    if (videos.length >= limit && limit !== Infinity) { // Add check for Infinity
      const tierDetails = getTierDetails(currentUser.subscriptionTier); // Changed to subscriptionTier
      setCurrentTierName(tierDetails.name); 
      setCurrentVideoLimit(tierDetails.limit); 
      setLimitReachedDialogOpen(true);
    } else {
      setUploadDialogOpen(true);
    }
  };
  
  const handleUploadSubmit = async (
    uploadData: UploadFormData, 
    videoFile: File | null, 
    thumbnailFile: File | null
  ) => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to upload videos.",
        variant: "destructive"
      });
      return;
    }
    
    setUploadDialogOpen(false);
    setIsUploading(true);
    
    try {
      let thumbnailUrl = uploadData.thumbnailUrl;
      let videoUrl = uploadData.videoUrl;
      
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `thumbnails/${currentUser.id}/${fileName}`;
        
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from('videos')
          .upload(filePath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (thumbnailError) {
          console.error('Thumbnail upload error:', thumbnailError);
          throw new Error(`Error uploading thumbnail: ${thumbnailError.message}`);
        }
        
        const { data: thumbnailUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        thumbnailUrl = thumbnailUrlData.publicUrl;
      }
      
      if (uploadData.uploadType === 'file' && videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `videos/${currentUser.id}/${fileName}`;
        
        const { error: videoError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (videoError) {
          console.error('Video upload error:', videoError);
          throw new Error(`Error uploading video: ${videoError.message}`);
        }
        
        const { data: videoUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        videoUrl = videoUrlData.publicUrl;
      }
      
      const newVideoData = {
        title: uploadData.title,
        description: uploadData.description,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        category_id: uploadData.categoryId,
        user_id: currentUser.id,
      };
      
      const { data, error } = await supabase
        .from('videos')
        .insert(newVideoData)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      const newVideo: Video = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        thumbnailUrl: data.thumbnail_url,
        videoUrl: data.video_url,
        categoryId: data.category_id,
        userId: data.user_id,
        likes: data.likes || 0,
        views: data.views || 0,
        createdAt: new Date(data.created_at),
        isHighlighted: data.is_highlighted || false
      };
      
      setVideos([newVideo, ...videos]);
      
      // Refresh categories in case a new one was created
      await fetchCategories();
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video is now available in your portfolio.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteConfirm = (videoId: string) => {
    setVideoToDelete(videoId);
    setDeleteConfirmOpen(true);
  };
  
  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoToDelete);
      
      if (error) {
        throw error;
      }
      
      setVideos(videos.filter(video => video.id !== videoToDelete));
      
      toast({
        title: "Video deleted",
        description: "The video has been removed from your portfolio.",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVideoToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleUpgradeRedirect = () => {
    setLimitReachedDialogOpen(false);
    navigate('/dashboard?tab=plan');
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {isClient 
                ? "Manage your client account and find video editors" 
                : "Manage your videos and portfolio"}
            </p>
          </div>
          
          {!isClient && (
            <div className="mt-4 md:mt-0">
              <Button onClick={handleUploadVideo} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {!isClient && (
          <>
            <VideoUploadDialog
              isOpen={uploadDialogOpen}
              onClose={() => setUploadDialogOpen(false)}
              onSubmit={handleUploadSubmit}
              categories={categories.map(cat => ({ ...cat, description: '', thumbnailUrl: '' }))}
              isUploading={isUploading}
            />
            
            <LimitReachedDialog
              isOpen={limitReachedDialogOpen}
              onClose={() => setLimitReachedDialogOpen(false)}
              onUpgrade={handleUpgradeRedirect}
              currentTierName={currentTierName}
              limit={currentVideoLimit}
            />

            <ConfirmationDialog
              isOpen={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              onConfirm={handleDeleteVideo}
              title="Delete Video"
              description="Are you sure you want to delete this video? This action cannot be undone."
              confirmLabel="Delete"
              cancelLabel="Cancel"
            />
          </>
        )}
        
        <Tabs defaultValue={defaultTab} className="w-full" onValueChange={(value) => navigate(`/dashboard?tab=${value}`)}>
          <TabsList className="mb-6 grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            {!isClient && (
              <>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">My Videos</span>
                </TabsTrigger>
                <TabsTrigger value="showreel" className="flex items-center gap-2">
                  <Film className="h-4 w-4" />
                  <span className="hidden sm:inline">My Showreel</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="messaging" className="relative flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messaging</span>
              {totalUnreadMessages > 0 && (
                <NotificationDot />
              )}
            </TabsTrigger>
            {isClient && (
              <TabsTrigger value="favorite-editors" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorite Editors</span>
              </TabsTrigger>
            )}
            {!isClient && (
              <>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="plan" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Plan</span>
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="account" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>
          
          {!isClient && (
            <>
              <TabsContent value="videos">
                <VideosTab
                  videos={videos}
                  categories={categories}
                  isLoading={isLoading}
                  onUploadClick={handleUploadVideo}
                  onDeleteClick={handleDeleteConfirm}
                />
              </TabsContent>
              
              <TabsContent value="showreel">
                <ShowreelTab 
                  videos={videos}
                  isLoading={isLoading}
                  onSetShowreel={handleSetShowreel}
                  currentShowreelUrl={currentShowreelUrl}
                  currentShowreelThumbnail={currentShowreelThumbnail}
                />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AnalyticsTab />
              </TabsContent>
              
              <TabsContent value="plan">
                <PlanTab />
              </TabsContent>
            </>
          )}
          
          <TabsContent value="messaging">
            <MessagingTab onTotalUnreadChange={setTotalUnreadMessages} />
          </TabsContent>
          
          {isClient && (
            <TabsContent value="favorite-editors">
              <FavoriteEditorsTab />
            </TabsContent>
          )}
          
          <TabsContent value="account">
            <AccountTab currentUser={currentUser as User} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
