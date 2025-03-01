import React, { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import CategorySlider from '@/components/CategorySlider';
import { 
  Category, 
  categories as defaultCategories, 
  Video, 
  parseJsonToCategory, 
  parseJsonToVideo
} from '@/types';
import { Save, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ProfileCard from '@/components/portfolio/ProfileCard';
import CategoryManager from '@/components/portfolio/CategoryManager';
import HeaderSection from '@/components/portfolio/HeaderSection';
import ShowreelSection from '@/components/portfolio/ShowreelSection';
import VideoGrid from '@/components/portfolio/VideoGrid';
import TestimonialsTab from '@/components/portfolio/TestimonialsTab';
import LoadingState from '@/components/portfolio/LoadingState';

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

// Default showreel URL
const defaultShowreelUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

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
  
  // Add state for about section, specializations, and showreel
  const [about, setAbout] = useState<string>('Professional video editor with expertise in various styles and techniques.');
  const [specializations, setSpecializations] = useState<string[]>(['Cinematic', 'Motion Graphics', 'Color Grading', 'VFX']);
  const [newSpecialization, setNewSpecialization] = useState<string>('');
  const [showreelUrl, setShowreelUrl] = useState<string>(defaultShowreelUrl);
  const [showreelThumbnail, setShowreelThumbnail] = useState<string>('https://images.unsplash.com/photo-1550745165-9bc0b252726f');
  
  // Edit mode dialogs
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [specializationsDialogOpen, setSpecializationsDialogOpen] = useState(false);
  const [showreelDialogOpen, setShowreelDialogOpen] = useState(false);
  
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
          
          // Set showreel_url if available
          if (data.showreel_url) {
            setShowreelUrl(data.showreel_url);
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
        showreel_url: showreelUrl,
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

  // Update showreel URL
  const updateShowreel = (url: string) => {
    setShowreelUrl(url);
    setShowreelDialogOpen(false);
    toast.success('Showreel URL updated');
  };
  
  // Update showreel thumbnail
  const updateShowreelThumbnail = (newThumbnailUrl: string) => {
    setShowreelThumbnail(newThumbnailUrl);
    toast.success('Showreel thumbnail updated');
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
    return <LoadingState />;
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
        <HeaderSection 
          featuredVideo={featuredVideo}
          currentUser={currentUser}
          editMode={editMode}
          thumbnailOptions={thumbnailOptions}
          updateVideoThumbnail={updateVideoThumbnail}
        />
        
        {/* Info section */}
        <section className="py-12 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <ProfileCard
                  currentUser={currentUser}
                  about={about}
                  setAbout={setAbout}
                  specializations={specializations}
                  setSpecializations={setSpecializations}
                  newSpecialization={newSpecialization}
                  setNewSpecialization={setNewSpecialization}
                  editMode={editMode}
                  aboutDialogOpen={aboutDialogOpen}
                  setAboutDialogOpen={setAboutDialogOpen}
                  specializationsDialogOpen={specializationsDialogOpen}
                  setSpecializationsDialogOpen={setSpecializationsDialogOpen}
                  handleAddSpecialization={handleAddSpecialization}
                  handleRemoveSpecialization={handleRemoveSpecialization}
                />
                
                {/* Category management - only visible in edit mode */}
                {editMode && (
                  <CategoryManager
                    userCategories={userCategories}
                    moveCategory={moveCategory}
                  />
                )}
              </div>
              
              <div className="md:w-2/3">
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                    {highlightedVideos.length > 0 && (
                      <TabsTrigger value="highlights">Highlights</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="portfolio" className="animate-fade-in opacity-0">
                    {/* Showreel Section - Moved inside the portfolio tab content */}
                    <ShowreelSection
                      showreelUrl={showreelUrl}
                      showreelThumbnail={showreelThumbnail}
                      editMode={editMode}
                      showreelDialogOpen={showreelDialogOpen}
                      setShowreelDialogOpen={setShowreelDialogOpen}
                      setShowreelUrl={setShowreelUrl}
                      updateShowreel={updateShowreel}
                      updateShowreelThumbnail={updateShowreelThumbnail}
                      thumbnailOptions={thumbnailOptions}
                    />
                    
                    <div className="mb-6">
                      <CategorySlider 
                        onSelectCategory={setSelectedCategory}
                        selectedCategoryId={selectedCategory?.id}
                        categories={userCategories}
                      />
                    </div>
                    
                    <VideoGrid
                      videos={filteredVideos}
                      editMode={editMode}
                      thumbnailOptions={thumbnailOptions}
                      updateVideoThumbnail={updateVideoThumbnail}
                      toggleHighlight={toggleHighlight}
                      setAsFeatured={setAsFeatured}
                    />
                  </TabsContent>
                  
                  <TabsContent value="highlights" className="animate-fade-in opacity-0">
                    <VideoGrid
                      videos={highlightedVideos}
                      editMode={editMode}
                      thumbnailOptions={thumbnailOptions}
                      updateVideoThumbnail={updateVideoThumbnail}
                      toggleHighlight={toggleHighlight}
                      setAsFeatured={setAsFeatured}
                    />
                  </TabsContent>
                  
                  <TabsContent value="testimonials" className="animate-fade-in opacity-0">
                    <TestimonialsTab editMode={editMode} />
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
