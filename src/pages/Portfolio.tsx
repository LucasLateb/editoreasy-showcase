import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import CategorySlider from '@/components/CategorySlider';
import VideoCard from '@/components/VideoCard';
import { 
  Category, 
  categories as defaultCategories, 
  Video, 
  parseJsonToCategory, 
  parseJsonToVideo,
  PortfolioSettings 
} from '@/types';
import { 
  Heart, 
  Eye, 
  Mail, 
  Play, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Star, 
  X, 
  Loader2,
  User,
  Briefcase,
  BadgePlus,
  Save,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

// Mock videos for portfolio
const mockPortfolioVideos = Array(12).fill(null).map((_, i) => ({
  id: `portfolio-video-${i}`,
  title: `${defaultCategories[i % defaultCategories.length].name} Project ${i + 1}`,
  description: 'Professional video editing project showcasing my skills.',
  thumbnailUrl: `https://images.unsplash.com/photo-${1550745165 + i * 10}-9bc0b252726f`,
  videoUrl: '#',
  categoryId: defaultCategories[i % defaultCategories.length].id,
  userId: '123', // Current user's ID
  likes: Math.floor(Math.random() * 50),
  views: Math.floor(Math.random() * 500),
  createdAt: new Date(),
  isHighlighted: false
}));

// Sample thumbnail options
const thumbnailOptions = [
  { id: '1', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: '2', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d' },
  { id: '3', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: '4', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' },
  { id: '5', url: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334' },
];

// Featured video
const defaultFeaturedVideo = {
  id: 'featured',
  title: 'Cinematic Brand Commercial',
  description: 'A high-impact commercial video created for a luxury brand with cinematic visuals and professional color grading.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  videoUrl: '#',
  categoryId: '2', // Cinematic
  userId: '123',
  likes: 137,
  views: 1243,
  createdAt: new Date(),
  isHighlighted: true
};

const Portfolio: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [userCategories, setUserCategories] = useState<Category[]>([...defaultCategories]);
  const [videos, setVideos] = useState<Video[]>([...mockPortfolioVideos]);
  const [featuredVideo, setFeaturedVideo] = useState<Video>(defaultFeaturedVideo);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideoForEdit, setSelectedVideoForEdit] = useState<Video | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add state for about section and specializations
  const [about, setAbout] = useState<string>('Professional video editor with expertise in various styles and techniques.');
  const [specializations, setSpecializations] = useState<string[]>(['Cinematic', 'Motion Graphics', 'Color Grading', 'VFX']);
  const [newSpecialization, setNewSpecialization] = useState<string>('');
  
  // Edit mode dialogs
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [specializationsDialogOpen, setSpecializationsDialogOpen] = useState(false);
  
  // Fetch portfolio settings on component mount
  useEffect(() => {
    const fetchPortfolioSettings = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('portfolio_settings')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Apply stored settings if available
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            try {
              const parsedCategories = (data.categories as any[]).map(category => parseJsonToCategory(category));
              setUserCategories(parsedCategories);
            } catch (e) {
              console.error('Failed to parse categories:', e);
            }
          }
          
          if (data.featured_video && typeof data.featured_video === 'object') {
            try {
              const parsedVideo = parseJsonToVideo(data.featured_video as any);
              setFeaturedVideo(parsedVideo);
            } catch (e) {
              console.error('Failed to parse featured video:', e);
            }
          }
          
          if (data.highlighted_videos && Array.isArray(data.highlighted_videos) && data.highlighted_videos.length > 0) {
            try {
              // Parse highlighted videos
              const parsedHighlightedVideos = (data.highlighted_videos as any[]).map(video => parseJsonToVideo(video));
              
              // Get IDs of highlighted videos
              const highlightedIds = parsedHighlightedVideos.map(vid => vid.id);
              
              // Update existing videos with highlighted status
              setVideos(prevVideos => 
                prevVideos.map(video => ({
                  ...video,
                  isHighlighted: highlightedIds.includes(video.id)
                }))
              );
            } catch (e) {
              console.error('Failed to parse highlighted videos:', e);
            }
          }

          // Set about and specializations if available
          if (data.about) {
            setAbout(data.about);
          }
          
          if (data.specializations && Array.isArray(data.specializations)) {
            setSpecializations(data.specializations as string[]);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio settings:', error);
        toast.error('Failed to load portfolio settings');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioSettings();
  }, [currentUser, isAuthenticated]);
  
  // Reorder categories
  const moveCategory = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === userCategories.length - 1)
    ) {
      return;
    }
    
    const newCategories = [...userCategories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const categoryToMove = newCategories[index];
    
    newCategories.splice(index, 1);
    newCategories.splice(newIndex, 0, categoryToMove);
    
    setUserCategories(newCategories);
    toast.success(`Category "${categoryToMove.name}" moved ${direction}`);
  }, [userCategories]);
  
  // Toggle edit mode and save changes when exiting edit mode
  const toggleEditMode = async () => {
    if (editMode) {
      // Save changes to database when exiting edit mode
      await saveChanges();
    }
    setEditMode(!editMode);
  };
  
  // Save changes to database
  const saveChanges = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('You must be logged in to save changes');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Get highlighted videos
      const highlightedVideos = videos.filter(video => video.isHighlighted);
      
      // Prepare data for Supabase by converting Date objects to strings and flattening objects
      const prepareForDatabase = (obj: any) => {
        return JSON.parse(JSON.stringify(obj, (key, value) => {
          // Convert Date objects to ISO strings
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }));
      };
      
      // Prepare data to be saved using helper function
      const portfolioData = {
        user_id: currentUser.id,
        categories: prepareForDatabase(userCategories),
        featured_video: prepareForDatabase(featuredVideo),
        highlighted_videos: prepareForDatabase(highlightedVideos),
        about: about,
        specializations: specializations,
        updated_at: new Date().toISOString()
      };
      
      // Upsert (insert or update) portfolio settings
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert(portfolioData, { onConflict: 'user_id' });
      
      if (error) {
        throw error;
      }
      
      toast.success('Portfolio settings saved successfully');
    } catch (error) {
      console.error('Error saving portfolio settings:', error);
      toast.error('Failed to save portfolio settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update video thumbnail
  const updateVideoThumbnail = (videoId: string, newThumbnailUrl: string) => {
    if (videoId === featuredVideo.id) {
      setFeaturedVideo({
        ...featuredVideo,
        thumbnailUrl: newThumbnailUrl
      });
      setSelectedVideoForEdit(null);
      toast.success('Featured video thumbnail updated');
      return;
    }
    
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video.id === videoId 
          ? { ...video, thumbnailUrl: newThumbnailUrl } 
          : video
      )
    );
    setSelectedVideoForEdit(null);
    toast.success('Video thumbnail updated');
  };
  
  // Toggle video highlight
  const toggleHighlight = (videoId: string) => {
    setVideos(prevVideos => 
      prevVideos.map(video => 
        video.id === videoId 
          ? { ...video, isHighlighted: !video.isHighlighted } 
          : video
      )
    );
    toast.success('Video highlight status updated');
  };
  
  // Set video as featured
  const setAsFeatured = (video: Video) => {
    const prevFeatured = featuredVideo;
    setFeaturedVideo(video);
    
    // Add the previous featured video to regular videos
    setVideos(prevVideos => {
      const videoExists = prevVideos.some(v => v.id === prevFeatured.id);
      if (!videoExists && prevFeatured.id !== video.id) {
        return [...prevVideos, prevFeatured];
      }
      return prevVideos.filter(v => v.id !== video.id);
    });
    
    toast.success('Featured video updated');
  };

  // Add new specialization
  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  // Remove specialization
  const handleRemoveSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };
  
  // Get videos filtered by category if one is selected
  const filteredVideos = selectedCategory 
    ? videos.filter(video => video.categoryId === selectedCategory.id)
    : videos;
  
  // Get highlighted videos
  const highlightedVideos = videos.filter(video => video.isHighlighted);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading portfolio settings...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Edit mode toggle */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={toggleEditMode} 
            className={cn(
              "rounded-full shadow-lg",
              editMode ? "bg-green-500 hover:bg-green-600" : "bg-primary"
            )}
            disabled={isSaving}
          >
            {editMode ? (
              isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save Changes
                  <Save className="ml-2 h-4 w-4" />
                </>
              )
            ) : (
              <>
                Edit Portfolio
                <Edit className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        
        {/* Featured video/header section */}
        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden group">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt="Featured work" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          </div>
          
          {editMode && (
            <div className="absolute top-4 right-4 z-10 space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                    Change Thumbnail
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Choose a thumbnail</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {thumbnailOptions.map(thumbnail => (
                      <Card 
                        key={thumbnail.id} 
                        className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                        onClick={() => updateVideoThumbnail(featuredVideo.id, thumbnail.url)}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-video relative overflow-hidden rounded">
                            <img 
                              src={thumbnail.url} 
                              alt={`Thumbnail option ${thumbnail.id}`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-16">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.2s' }}>
                  {currentUser?.name || 'Video Editor'} Portfolio
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-in-down opacity-0" style={{ animationDelay: '0.4s' }}>
                  {currentUser?.bio || 'Professional video editor specializing in cinematic visuals, motion graphics, and compelling storytelling.'}
                </p>
                
                <div className="flex flex-wrap gap-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.6s' }}>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Play className="h-4 w-4" />
                    <span>Featured Work</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Heart className="h-4 w-4" />
                    <span>{featuredVideo.likes} Likes</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Eye className="h-4 w-4" />
                    <span>{featuredVideo.views} Views</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Info section */}
        <section className="py-12 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
                  {/* Profile information */}
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4 border-2 border-background shadow-sm">
                      <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} />
                      <AvatarFallback className="text-lg">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-medium">{currentUser?.name || 'Video Editor'}</h2>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2">
                          {currentUser?.subscriptionTier.charAt(0).toUpperCase() + currentUser?.subscriptionTier.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {currentUser?.likes || 0} likes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-6">
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
                              <DialogTitle>Edit About Section</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <Textarea 
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                placeholder="Write something about yourself..."
                                className="min-h-[120px]"
                              />
                              <div className="flex justify-end">
                                <Button onClick={() => setAboutDialogOpen(false)}>
                                  Save
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {about || (currentUser?.bio || 'Professional video editor with expertise in various styles and techniques.')}
                    </p>
                    
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
                    </div>
                    
                    <Button className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Me
                    </Button>
                  </div>
                </div>
                
                {/* Category management - only visible in edit mode */}
                {editMode && (
                  <div className="mt-6 bg-background rounded-2xl shadow-sm p-6 border border-border">
                    <h3 className="font-medium mb-4">Manage Categories</h3>
                    <div className="space-y-2">
                      {userCategories.map((category, index) => (
                        <div key={category.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                          <span>{category.name}</span>
                          <div className="flex space-x-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => moveCategory(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => moveCategory(index, 'down')}
                              disabled={index === userCategories.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:w-2/3">
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="showreel">Showreel</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                    {highlightedVideos.length > 0 && (
                      <TabsTrigger value="highlights">Highlights</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="portfolio" className="animate-fade-in opacity-0">
                    <div className="mb-6">
                      <CategorySlider 
                        onSelectCategory={setSelectedCategory}
                        selectedCategoryId={selectedCategory?.id}
                        categories={userCategories}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVideos.map((video) => (
                        <div key={video.id} className="relative group">
                          <VideoCard video={video} />
                          
                          {editMode && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="icon" variant="outline" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Video</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      {thumbnailOptions.map(thumbnail => (
                                        <Card 
                                          key={thumbnail.id} 
                                          className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                                          onClick={() => updateVideoThumbnail(video.id, thumbnail.url)}
                                        >
                                          <CardContent className="p-2">
                                            <div className="aspect-video relative overflow-hidden rounded">
                                              <img 
                                                src={thumbnail.url} 
                                                alt={`Thumbnail option ${thumbnail.id}`} 
                                                className="w-full h-full object-cover" 
                                              />
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                    <div className="flex justify-between">
                                      <Button 
                                        variant={video.isHighlighted ? "destructive" : "outline"}
                                        onClick={() => toggleHighlight(video.id)}
                                      >
                                        {video.isHighlighted ? (
                                          <>
                                            <X className="mr-2 h-4 w-4" />
                                            Remove Highlight
                                          </>
                                        ) : (
                                          <>
                                            <Star className="mr-2 h-4 w-4" />
                                            Highlight Video
                                          </>
                                        )}
                                      </Button>
                                      
                                      <Button 
                                        variant="default"
                                        onClick={() => setAsFeatured(video)}
                                      >
                                        Set as Featured
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="highlights" className="animate-fade-in opacity-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {highlightedVideos.map((video) => (
                        <div key={video.id} className="relative group">
                          <VideoCard video={video} />
                          
                          {editMode && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => toggleHighlight(video.id)}
                                className="bg-background/80 backdrop-blur-sm"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="showreel" className="animate-fade-in opacity-0">
                    <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="aspect-video relative">
                        <img 
                          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f" 
                          alt="Showreel thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer">
                            <Play className="h-10 w-10 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-medium mb-2">2023 Video Editing Showreel</h3>
                        <p className="text-muted-foreground">
                          A compilation of my best work from the past year, showcasing various styles and techniques.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="testimonials" className="animate-fade-in opacity-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array(4).fill(null).map((_, i) => (
                        <div key={i} className={cn(
                          "p-6 rounded-2xl border border-border bg-background shadow-sm",
                          i === 0 && "md:col-span-2"
                        )}>
                          <div className="flex items-center mb-4">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>
                                {['JD', 'AM', 'TS', 'RK'][i % 4]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {['John Doe', 'Alice Miller', 'Tom Smith', 'Rachel Kim'][i % 4]}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {['Marketing Director', 'Film Producer', 'Brand Manager', 'Creative Director'][i % 4]}
                              </p>
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {[
                              "Working with this editor was a game-changer for our brand. The cinematic quality and storytelling brought our vision to life perfectly.",
                              "Extremely professional and creative. Delivered the project ahead of schedule with excellent quality.",
                              "The attention to detail and technical skills are outstanding. Will definitely hire again for future projects.",
                              "A true professional who understands both the technical and creative aspects of video editing."
                            ][i % 4]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Portfolio;
