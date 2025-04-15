import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { Save, Edit, Loader2, ClipboardCopy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

import ProfileCard from '@/components/portfolio/ProfileCard';
import CategoryManager from '@/components/portfolio/CategoryManager';
import HeaderSection from '@/components/portfolio/HeaderSection';
import ShowreelSection from '@/components/portfolio/ShowreelSection';
import VideoGrid from '@/components/portfolio/VideoGrid';
import TestimonialsTab from '@/components/portfolio/TestimonialsTab';
import LoadingState from '@/components/portfolio/LoadingState';

const CopyPortfolioLink: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Portfolio link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy the link.');
    }
  };

  return (
    <Button onClick={handleCopy} variant="outline" className="w-full mt-2">
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <ClipboardCopy className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
};

interface PortfolioProps {
  isViewOnly?: boolean;
}

const mockPortfolioVideos = Array(12).fill(null).map((_, i) => ({
  id: `portfolio-video-${i}`,
  title: `${defaultCategories[i % defaultCategories.length].name} Project ${i + 1}`,
  description: 'Professional video editing project showcasing my skills.',
  thumbnailUrl: `https://images.unsplash.com/photo-${1550745165 + i * 10}-9bc0b252726f`,
  videoUrl: '#',
  categoryId: defaultCategories[i % defaultCategories.length].id,
  userId: '123',
  likes: Math.floor(Math.random() * 50),
  views: Math.floor(Math.random() * 500),
  createdAt: new Date(),
  isHighlighted: false
}));

const thumbnailOptions = [
  { id: '1', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b' },
  { id: '2', url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d' },
  { id: '3', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158' },
  { id: '4', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085' },
  { id: '5', url: 'https://images.unsplash.com/photo-1483058712412-4245e9b90334' },
];

const defaultFeaturedVideo = {
  id: 'featured',
  title: 'Cinematic Brand Commercial',
  description: 'A high-impact commercial video created for a luxury brand with cinematic visuals and professional color grading.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  videoUrl: '#',
  categoryId: '2',
  userId: '123',
  likes: 137,
  views: 1243,
  createdAt: new Date(),
  isHighlighted: true
};

const Portfolio: React.FC<PortfolioProps> = ({ isViewOnly = false }) => {
  const { id: editorId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const userId = isViewOnly ? editorId : currentUser?.id;
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [userCategories, setUserCategories] = useState<Category[]>([...defaultCategories]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<Video>(defaultFeaturedVideo);
  const [editMode, setEditMode] = useState(false);
  const [selectedVideoForEdit, setSelectedVideoForEdit] = useState<Video | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [about, setAbout] = useState<string>('Professional video editor with expertise in various styles and techniques.');
  const [specializations, setSpecializations] = useState<string[]>(['Cinematic', 'Motion Graphics', 'Color Grading', 'VFX']);
  const [newSpecialization, setNewSpecialization] = useState<string>('');
  const [showreelUrl, setShowreelUrl] = useState<string>('');
  const [showreelThumbnail, setShowreelThumbnail] = useState<string>('https://images.unsplash.com/photo-1550745165-9bc0b252726f');
  
  const [portfolioTitle, setPortfolioTitle] = useState<string>(`${currentUser?.name || 'Video Editor'} Portfolio`);
  const [portfolioDescription, setPortfolioDescription] = useState<string>(
    currentUser?.bio || 'Professional video editor specializing in cinematic visuals, motion graphics, and compelling storytelling.'
  );
  
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [specializationsDialogOpen, setSpecializationsDialogOpen] = useState(false);
  const [showreelDialogOpen, setShowreelDialogOpen] = useState(false);
  
  // Added state to store editor data when in view-only mode
  const [editorData, setEditorData] = useState<any>(null);
  
  useEffect(() => {
    const fetchPortfolioSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        if (isViewOnly) {
          toast.error('Editor not found');
        }
        return;
      }
      
      try {
        const { data: portfolioSettings, error: portfolioError } = await supabase
          .from('portfolio_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (portfolioError) {
          throw portfolioError;
        }
        
        if (portfolioSettings) {
          if (portfolioSettings.categories && Array.isArray(portfolioSettings.categories) && portfolioSettings.categories.length > 0) {
            try {
              const parsedCategories = (portfolioSettings.categories as any[]).map(category => parseJsonToCategory(category));
              setUserCategories(parsedCategories);
            } catch (e) {
              console.error('Failed to parse categories:', e);
            }
          }
          
          if (portfolioSettings.featured_video && typeof portfolioSettings.featured_video === 'object') {
            try {
              const parsedVideo = parseJsonToVideo(portfolioSettings.featured_video as any);
              setFeaturedVideo(parsedVideo);
            } catch (e) {
              console.error('Failed to parse featured video:', e);
            }
          }
          
          if (portfolioSettings.highlighted_videos && Array.isArray(portfolioSettings.highlighted_videos) && portfolioSettings.highlighted_videos.length > 0) {
            try {
              const parsedHighlightedVideos = (portfolioSettings.highlighted_videos as any[]).map(video => parseJsonToVideo(video));
              
              const highlightedIds = parsedHighlightedVideos.map(vid => vid.id);
              
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
          
          if (portfolioSettings.portfolio_title) {
            setPortfolioTitle(portfolioSettings.portfolio_title);
          }
          
          if (portfolioSettings.portfolio_description) {
            setPortfolioDescription(portfolioSettings.portfolio_description);
          }
          
          if (portfolioSettings.showreel_url) {
            setShowreelUrl(portfolioSettings.showreel_url);
          }

          if (portfolioSettings.about) {
            setAbout(portfolioSettings.about);
          }

          if (portfolioSettings.specializations) {
            setSpecializations(portfolioSettings.specializations as string[]);
          }
        }

        if (isViewOnly) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (userError) {
            throw userError;
          }

          if (!userData) {
            console.error('Could not find user profile');
            toast.error('Could not find editor profile');
          } else {
            setEditorData(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching portfolio settings:', error);
        toast.error('Failed to load portfolio settings');
      }

      try {
        const { data: videos, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (videosError) {
          throw videosError;
        }
        
        if (videos) {
          const formattedVideos: Video[] = videos.map(video => ({
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
            isHighlighted: video.is_highlighted || false
          }));
          
          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };
    
    setIsLoading(true);
    fetchPortfolioSettings();
  }, [userId, isViewOnly]);
  
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
  
  const toggleEditMode = async () => {
    if (editMode) {
      await saveChanges();
    }
    setEditMode(!editMode);
  };
  
  const saveChanges = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('You must be logged in to save changes');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const highlightedVideos = videos.filter(video => video.isHighlighted);
      
      const prepareForDatabase = (obj: any) => {
        return JSON.parse(JSON.stringify(obj, (key, value) => {
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        }));
      };
      
      const portfolioData = {
        user_id: currentUser.id,
        categories: prepareForDatabase(userCategories),
        featured_video: prepareForDatabase(featuredVideo),
        highlighted_videos: prepareForDatabase(highlightedVideos),
        about: about,
        specializations: specializations,
        showreel_url: showreelUrl,
        portfolio_title: portfolioTitle,
        portfolio_description: portfolioDescription,
        updated_at: new Date().toISOString()
      };
      
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
  
  const setAsFeatured = (video: Video) => {
    const prevFeatured = featuredVideo;
    setFeaturedVideo(video);
    
    setVideos(prevVideos => {
      const videoExists = prevVideos.some(v => v.id === prevFeatured.id);
      if (!videoExists && prevFeatured.id !== video.id) {
        return [...prevVideos, prevFeatured];
      }
      return prevVideos.filter(v => v.id !== video.id);
    });
    
    toast.success('Featured video updated');
  };

  const updateShowreel = (url: string) => {
    console.log('Updating showreel URL to:', url);
    setShowreelUrl(url);
    setShowreelDialogOpen(false);
    toast.success('Showreel URL updated');
  };
  
  const updateShowreelThumbnail = (newThumbnailUrl: string) => {
    setShowreelThumbnail(newThumbnailUrl);
    toast.success('Showreel thumbnail updated');
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim()) {
      setSpecializations([...specializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };
  
  const filteredVideos = selectedCategory 
    ? videos.filter(video => video.categoryId === selectedCategory.id)
    : videos;
  
  const highlightedVideos = videos.filter(video => video.isHighlighted);
  
  if (isLoading) {
    return <LoadingState message={isViewOnly ? "Loading editor portfolio..." : "Loading your portfolio..."} />;
  }
  
  if (!userId && isViewOnly) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Editor Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The editor you're looking for couldn't be found. Please check the URL and try again.
          </p>
          <Button asChild>
            <Link to="/explore">Browse Editors</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {!isViewOnly && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button 
              onClick={toggleEditMode} 
              className={cn(
                "rounded-full shadow-lg",
                editMode ? "bg-green-500 hover:bg-green-600" : "bg-primary"
              )}
              disabled={isSaving || !currentUser}
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
        )}
        
        <HeaderSection 
          featuredVideo={featuredVideo}
          currentUser={isViewOnly ? editorData : currentUser}
          editMode={editMode}
          thumbnailOptions={thumbnailOptions}
          updateVideoThumbnail={updateVideoThumbnail}
          title={portfolioTitle}
          setTitle={setPortfolioTitle}
          description={portfolioDescription}
          setDescription={setPortfolioDescription}
        />
        
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
                  isViewOnly={isViewOnly}
                  editorData={editorData}
                />
                <CopyPortfolioLink />
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
