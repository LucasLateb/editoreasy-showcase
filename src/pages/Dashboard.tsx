import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Video, categories } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, UploadCloud, Film } from 'lucide-react';
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
  onSetShowreel: (videoUrl: string) => void;
  currentShowreelUrl: string | null;
}

const ShowreelTab: React.FC<ShowreelTabProps> = ({ 
  videos, 
  isLoading, 
  onSetShowreel,
  currentShowreelUrl
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleSetShowreel = async (video: Video) => {
    setSelectedVideo(video);
    onSetShowreel(video.videoUrl);
  };
  
  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      onSetShowreel(customUrl.trim());
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="bg-background p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Current Showreel</h2>
        {currentShowreelUrl ? (
          <div className="aspect-video relative mb-4">
            <iframe 
              src={currentShowreelUrl}
              title="Current Showreel" 
              className="w-full h-full border rounded-md"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
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
                onClick={() => handleSetShowreel(video)}
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
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  // Fetch user videos and portfolio settings on component mount
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
        .select('showreel_url')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setCurrentShowreelUrl(data.showreel_url);
      }
    } catch (error) {
      console.error('Error fetching portfolio settings:', error);
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
      
      // Transform the data to match our Video type
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
  
  const handleSetShowreel = async (url: string) => {
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
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setCurrentShowreelUrl(url);
      toast({
        title: "Showreel updated",
        description: "Your showreel has been updated successfully."
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
      
      // If a thumbnail file was selected, upload it to Supabase storage
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
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);
        
        thumbnailUrl = publicUrlData.publicUrl;
      }
      
      // Create a new video object for the database
      const newVideoData = {
        title: uploadData.title,
        description: uploadData.description,
        thumbnail_url: thumbnailUrl,
        video_url: uploadData.uploadType === 'link' ? uploadData.videoUrl : 'file://local-upload',
        category_id: uploadData.categoryId,
        user_id: currentUser.id,
      };
      
      // Insert the video into the database
      const { data, error } = await supabase
        .from('videos')
        .insert(newVideoData)
        .select('*')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Create a new video object for the state
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
      
      // Add the new video to the videos array
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
      // Delete from Supabase
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoToDelete);
      
      if (error) {
        throw error;
      }
      
      // Update state
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
      // Clean up
      setVideoToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };
  
  // If not logged in, redirect to login
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
        
        {/* Upload Video Dialog */}
        <VideoUploadDialog
          isOpen={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          onSubmit={handleUploadSubmit}
          categories={categories}
          isUploading={isUploading}
        />
        
        {/* Delete Confirmation Dialog */}
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
