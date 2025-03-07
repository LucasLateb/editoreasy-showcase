import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Video, categories } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, UploadCloud, Film, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import VideoUploadDialog, { UploadFormData } from '@/components/dashboard/VideoUploadDialog';
import VideosTab from '@/components/dashboard/VideosTab';
import AnalyticsTab from '@/components/dashboard/AnalyticsTab';
import AccountTab from '@/components/dashboard/AccountTab';

interface ShowreelTabProps {
  videos: Video[];
  isLoading: boolean;
  onSetShowreel: (videoUrl: string, thumbnailUrl?: string) => void;
  currentShowreelUrl: string | null;
  currentShowreelThumbnail: string | null;
}

const ShowreelTab: React.FC<ShowreelTabProps> = ({ 
  videos, 
  isLoading, 
  onSetShowreel,
  currentShowreelUrl,
  currentShowreelThumbnail
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [videoToConfirm, setVideoToConfirm] = useState<Video | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const { toast } = useToast();
  
  const handleSelectShowreel = (video: Video) => {
    setVideoToConfirm(video);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmShowreel = () => {
    if (videoToConfirm) {
      try {
        // Ensure the video URL is valid
        if (videoToConfirm.videoUrl.includes('<iframe')) {
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else if (videoToConfirm.videoUrl.startsWith('http://') || videoToConfirm.videoUrl.startsWith('https://')) {
          new URL(videoToConfirm.videoUrl);
          onSetShowreel(videoToConfirm.videoUrl, videoToConfirm.thumbnailUrl);
        } else {
          throw new Error('Invalid URL format');
        }
        
        setSelectedVideo(videoToConfirm);
        toast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
      } catch (error) {
        console.error("Invalid video URL:", error);
        toast({
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
        // Basic validation to check if input looks like a URL
        if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://') && !customUrl.includes('<iframe')) {
          throw new Error('URL must start with http:// or https:// or be an iframe embed code');
        }
        
        onSetShowreel(customUrl.trim(), customThumbnailUrl || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81');
        toast({
          title: "Showreel updated",
          description: "Your portfolio showreel has been updated successfully."
        });
      } catch (error) {
        console.error("Invalid custom URL:", error);
        toast({
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const isEmbedCode = currentShowreelUrl && currentShowreelUrl.includes('<iframe');
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
  if (isEmbedCode && currentShowreelUrl) {
    displayUrl = extractSrcFromEmbed(currentShowreelUrl);
  } else if (currentShowreelUrl) {
    displayUrl = currentShowreelUrl;
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Current Showreel</h2>
        {currentShowreelUrl ? (
          <div className="aspect-video relative mb-4">
            {showVideo ? (
              isEmbedCode ? (
                <div dangerouslySetInnerHTML={{ __html: currentShowreelUrl }} className="w-full h-full" />
              ) : (
                <iframe 
                  src={displayUrl}
                  title="Current Showreel" 
                  className="w-full h-full border rounded-md"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              )
            ) : (
              <div className="relative w-full h-full">
                <img 
                  src={currentShowreelThumbnail || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81'} 
                  alt="Showreel thumbnail" 
                  className="w-full h-full object-cover border rounded-md"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer"
                    onClick={handlePlayClick}
                  >
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-secondary aspect-video rounded-md mb-4">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No showreel set</p>
          </div>
        )}
      </div>
      
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
      
      {videos.length > 0 && (
        <div className="bg-background p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Select from Your Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
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
      
      {/* Confirmation Dialog */}
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

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [currentShowreelUrl, setCurrentShowreelUrl] = useState<string | null>(null);
  const [currentShowreelThumbnail, setCurrentShowreelThumbnail] = useState<string | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchUserVideos(),
        fetchPortfolioSettings()
      ]);
    }
  }, [currentUser]);
  
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
      toast({
        title: "Error loading showreel",
        description: "There was a problem loading your showreel settings.",
        variant: "destructive"
      });
    }
  };
  
  const fetchUserVideos = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUser?.id)
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
    setUploadDialogOpen(true);
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
      
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `thumbnails/${fileName}`;
        
        const { data: storageData, error: storageError } = await supabase.storage
          .from('videos')
          .upload(filePath, thumbnailFile);
        
        if (storageError) {
          throw storageError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrlData.publicUrl;
      }
      
      const newVideoData = {
        title: uploadData.title,
        description: uploadData.description,
        thumbnail_url: thumbnailUrl,
        video_url: uploadData.uploadType === 'link' ? uploadData.videoUrl : 'file://local-upload',
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
      
      toast({
        title: "Video uploaded successfully",
        description: "Your video is now available in your portfolio.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
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
  
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your videos and portfolio</p>
          </div>
          
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
        </div>
        
        <VideoUploadDialog
          isOpen={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSubmit={handleUploadSubmit}
          categories={categories}
          isUploading={isUploading}
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
        
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="videos">My Videos</TabsTrigger>
            <TabsTrigger value="showreel">My Showreel</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
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
          
          <TabsContent value="account">
            <AccountTab currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
