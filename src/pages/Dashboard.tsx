
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Video, categories } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Film, Pencil, Trash2, UploadCloud, Link as LinkIcon, FileVideo, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import ConfirmationDialog from '@/components/ConfirmationDialog';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'link' | 'file' | null>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    categoryId: categories[0].id,
    thumbnailUrl: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);

  // Thumbnail preview
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Predefined thumbnails for selection
  const predefinedThumbnails = [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    'https://images.unsplash.com/photo-1550745166-9bc0b2527af',
    'https://images.unsplash.com/photo-1550745167-9bc0b2528ab',
    'https://images.unsplash.com/photo-1550745168-9bc0b2529ac',
  ];
  
  // Fetch user videos on component mount
  useEffect(() => {
    if (currentUser) {
      fetchUserVideos();
    }
  }, [currentUser]);
  
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
  
  const handleUploadVideo = () => {
    setUploadDialogOpen(true);
  };

  const handleThumbnailSelect = (url: string) => {
    setUploadData({...uploadData, thumbnailUrl: url});
    setThumbnailPreview(url);
    setThumbnailFile(null);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setUploadData({...uploadData, thumbnailUrl: ''});
    }
  };
  
  const handleUploadSubmit = async () => {
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
      } else if (!thumbnailUrl) {
        // If no thumbnail was selected, use a default one
        thumbnailUrl = predefinedThumbnails[0];
      }
      
      // Create a new video object for the database
      const newVideoData = {
        title: uploadData.title,
        description: uploadData.description,
        thumbnail_url: thumbnailUrl,
        video_url: uploadType === 'link' ? uploadData.videoUrl : 'file://local-upload', // This would need to change if actually uploading files
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
      
      // Reset form data
      setUploadData({
        title: '',
        description: '',
        videoUrl: '',
        categoryId: categories[0].id,
        thumbnailUrl: '',
      });
      setVideoFile(null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setUploadType(null);
      
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
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Upload New Video</DialogTitle>
              <DialogDescription>
                Add a new video to your portfolio. Fill out the details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Video Title</Label>
                <Input 
                  id="title" 
                  value={uploadData.title} 
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  placeholder="Enter a title for your video"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={uploadData.categoryId}
                  onChange={(e) => setUploadData({...uploadData, categoryId: e.target.value})}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={uploadData.description} 
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Describe your video"
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Video Source</Label>
                <div className="flex gap-4 mt-1">
                  <Button 
                    type="button" 
                    variant={uploadType === 'link' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setUploadType('link')}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Video Link
                  </Button>
                  <Button 
                    type="button" 
                    variant={uploadType === 'file' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setUploadType('file')}
                  >
                    <FileVideo className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>
              </div>
              
              {uploadType === 'link' && (
                <div className="grid gap-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input 
                    id="videoUrl" 
                    value={uploadData.videoUrl} 
                    onChange={(e) => setUploadData({...uploadData, videoUrl: e.target.value})}
                    placeholder="Enter YouTube or Vimeo URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports YouTube, Vimeo, and other video hosting platforms
                  </p>
                </div>
              )}
              
              {uploadType === 'file' && (
                <div className="grid gap-2">
                  <Label htmlFor="videoFile">Video File</Label>
                  <div className="border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {videoFile ? videoFile.name : 'Drag and drop or click to upload'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports MP4, MOV, AVI (max 500MB)
                    </p>
                    <Input 
                      id="videoFile" 
                      type="file"
                      className="hidden"
                      accept=".mp4,.mov,.avi"
                      onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => document.getElementById('videoFile')?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                </div>
              )}

              {/* Thumbnail Selection Section */}
              <div className="grid gap-2">
                <Label>Thumbnail</Label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Predefined thumbnails */}
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-2">Select a thumbnail:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {predefinedThumbnails.map((thumbnail, index) => (
                        <div 
                          key={index}
                          className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${uploadData.thumbnailUrl === thumbnail ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted'}`}
                          onClick={() => handleThumbnailSelect(thumbnail)}
                        >
                          <img 
                            src={thumbnail} 
                            alt={`Thumbnail ${index + 1}`} 
                            className="w-full h-16 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload custom thumbnail */}
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Or upload your own:</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="border-2 border-dashed border-input rounded-md p-3 flex flex-col items-center justify-center">
                          <Image className="h-5 w-5 text-muted-foreground mb-1" />
                          <p className="text-xs text-muted-foreground">
                            {thumbnailFile ? thumbnailFile.name : 'Click to upload'}
                          </p>
                          <Input 
                            id="thumbnailFile" 
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleThumbnailFileChange}
                          />
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('thumbnailFile')?.click()}
                      >
                        Select Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <div className="border rounded-md overflow-hidden aspect-video">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleUploadSubmit}
                disabled={!uploadData.title || (!uploadData.videoUrl && uploadType === 'link') || (!videoFile && uploadType === 'file') || !uploadType || (!uploadData.thumbnailUrl && !thumbnailFile)}
              >
                Upload Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : videos.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No videos yet</h3>
                  <p className="text-muted-foreground mb-6">Upload your first video to start building your portfolio</p>
                  <Button onClick={handleUploadVideo}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => {
                  const category = categories.find(c => c.id === video.categoryId);
                  
                  return (
                    <Card key={video.id} className="overflow-hidden hover-scale">
                      <div className="relative aspect-video">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 rounded-full px-2 py-1 bg-primary/90 text-xs text-white">
                          {category?.name}
                        </div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{video.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {video.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="text-sm text-muted-foreground pb-0">
                        <div className="flex space-x-4">
                          <div>{video.views} views</div>
                          <div>{video.likes} likes</div>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between pt-4">
                        <Button size="sm" variant="outline">
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteConfirm(video.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Analytics</CardTitle>
                <CardDescription>
                  View statistics about your portfolio performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="text-muted-foreground text-sm mb-1">Total Views</div>
                    <div className="text-3xl font-bold">1,245</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="text-muted-foreground text-sm mb-1">Likes</div>
                    <div className="text-3xl font-bold">86</div>
                  </div>
                  <div className="bg-background p-4 rounded-lg border border-border">
                    <div className="text-muted-foreground text-sm mb-1">Profile Visits</div>
                    <div className="text-3xl font-bold">324</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <p className="text-center text-muted-foreground italic">
                    More detailed analytics available in Premium and Pro plans
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information and subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Name</label>
                        <input 
                          type="text" 
                          className="glass-input w-full p-2 rounded-md" 
                          defaultValue={currentUser.name}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Email</label>
                        <input 
                          type="email" 
                          className="glass-input w-full p-2 rounded-md" 
                          defaultValue={currentUser.email}
                          disabled
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Bio</label>
                        <textarea 
                          className="glass-input w-full p-2 rounded-md h-24" 
                          defaultValue={currentUser.bio || ''}
                          placeholder="Tell clients about your video editing style and experience..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Subscription</h3>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Current Plan: {currentUser.subscriptionTier.charAt(0).toUpperCase() + currentUser.subscriptionTier.slice(1)}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {currentUser.subscriptionTier === 'free' 
                              ? 'Upgrade to unlock more features' 
                              : 'Your subscription renews on October 12, 2023'}
                          </p>
                        </div>
                        <Button variant="outline">
                          {currentUser.subscriptionTier === 'free' ? 'Upgrade' : 'Manage'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
