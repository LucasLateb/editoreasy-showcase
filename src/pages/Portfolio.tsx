import React, { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import CategorySlider from '@/components/CategorySlider';
import { 
  Video, 
  parseJsonToCategory, 
  parseJsonToVideo,
  categories as defaultCategories
} from '@/types';
import { Save, Edit, Loader2, ClipboardCopy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import useViewTracking from '@/hooks/useViewTracking';
import { useTranslation } from 'react-i18next';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';

import ProfileCard from '@/components/portfolio/ProfileCard';
import CategoryManager from '@/components/portfolio/CategoryManager';
import HeaderSection from '@/components/portfolio/HeaderSection';
import ShowreelSection from '@/components/portfolio/ShowreelSection';
import VideoGrid from '@/components/portfolio/VideoGrid';
import LinksTab from '@/components/portfolio/LinksTab';
import LoadingState from '@/components/portfolio/LoadingState';
import CopyPortfolioLink from '@/components/CopyPortfolioLink';

interface PortfolioProps {
  isViewOnly?: boolean;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'website' | 'other';
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
  const { id: editorId } = useParams<{ id: string }>();
  const { currentUser, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const userId = isViewOnly ? editorId : currentUser?.id;
  
  const [selectedCategory, setSelectedCategory] = useState<any>(undefined);
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
  
  const [portfolioTitle, setPortfolioTitle] = useState<string>(
    (currentUser?.name ? `${currentUser.name}'s Portfolio` : 'Video Editor Portfolio')
  );
  const [portfolioDescription, setPortfolioDescription] = useState<string>(
    currentUser?.bio || 'Professional video editor specializing in cinematic visuals, motion graphics, and compelling storytelling.'
  );
  
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const [specializationsDialogOpen, setSpecializationsDialogOpen] = useState(false);
  const [showreelDialogOpen, setShowreelDialogOpen] = useState(false);
  
  const [editorData, setEditorData] = useState<any>(null);
  
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const [links, setLinks] = useState<LinkItem[]>([]);

  // Utiliser le hook avec les vidéos du portfolio pour le tri des catégories
  const { categories: allCategories, getCategoryById } = useCategoriesWithFallback(videos);

  const updatePortfolioTitle = async (title: string) => {
    if (!currentUser?.id) {
      toast.error(t('Portfolio.SaveChanges'));
      return;
    }
    
    setIsSavingTitle(true);
    
    try {
      const { error } = await supabase
        .from('portfolio_settings')
        .update({ portfolio_title: title })
        .eq('user_id', currentUser.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(t('Portfolio.SaveChanges'));
    } catch (error) {
      console.error('Error updating portfolio title:', error);
      toast.error('Failed to update portfolio title');
    } finally {
      setIsSavingTitle(false);
    }
  };

  const { recordPortfolioView } = useViewTracking();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        if (isViewOnly) {
          toast.error(t('Portfolio.EditorNotFound'));
        }
        return;
      }
      
      setIsLoading(true);
      let fetchedPortfolioSettingsData: any = null;
      let fetchedVideosData: Video[] = [];

      try {
        const { data: portfolioSettings, error: portfolioError } = await supabase
          .from('portfolio_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (portfolioError) {
          throw portfolioError;
        }
        fetchedPortfolioSettingsData = portfolioSettings;

        if (portfolioSettings) {
          if (portfolioSettings.featured_video && typeof portfolioSettings.featured_video === 'object') {
            try {
              const parsedVideo = parseJsonToVideo(portfolioSettings.featured_video as any);
              setFeaturedVideo(parsedVideo);
            } catch (e) {
              console.error('Failed to parse featured video:', e);
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
          if (portfolioSettings.showreel_thumbnail) {
            setShowreelThumbnail(portfolioSettings.showreel_thumbnail);
          }
          if (portfolioSettings.about) {
            setAbout(portfolioSettings.about);
          }
          if (portfolioSettings.specializations) {
            setSpecializations(portfolioSettings.specializations as string[]);
          }
          if (portfolioSettings.links && Array.isArray(portfolioSettings.links)) {
            try {
              const parsedLinks = portfolioSettings.links.map((link: any) => ({
                id: String(link.id || ''),
                title: String(link.title || ''),
                url: String(link.url || ''),
                platform: link.platform as LinkItem['platform'] || 'other'
              }));
              setLinks(parsedLinks);
            } catch (e) {
              console.error('Failed to parse links:', e);
              setLinks([]);
            }
          }
        }

        if (isViewOnly) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (userError) throw userError;
          if (!userData) {
            console.error('Could not find user profile for editorId:', userId);
            toast.error('Could not find editor profile');
            setEditorData(null);
          } else {
            setEditorData(userData);
            if (userData.name) {
                setPortfolioTitle(`${userData.name}'s Portfolio`);
            }
            if (userData.bio) {
                setPortfolioDescription(userData.bio);
            }
          }
        } else {
           if(currentUser?.name) setPortfolioTitle(`${currentUser.name}'s Portfolio`);
           if(currentUser?.bio) setPortfolioDescription(currentUser.bio);
        }
      } catch (error) {
        console.error('Error fetching portfolio settings or user profile:', error);
        toast.error('Failed to load portfolio settings');
      }

      try {
        const { data: videosFromDb, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (videosError) throw videosError;
        
        if (videosFromDb) {
          const formattedVideos: Video[] = videosFromDb.map(video => ({
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
          
          if (fetchedPortfolioSettingsData?.highlighted_videos && Array.isArray(fetchedPortfolioSettingsData.highlighted_videos)) {
            try {
              const parsedHighlightedVideos = (fetchedPortfolioSettingsData.highlighted_videos as any[]).map(video => parseJsonToVideo(video));
              const highlightedIds = new Set(parsedHighlightedVideos.map(vid => vid.id));
              fetchedVideosData = formattedVideos.map(video => ({
                ...video,
                isHighlighted: highlightedIds.has(video.id) || video.isHighlighted,
              }));
            } catch (e) {
              console.error('Failed to parse highlighted videos from settings:', e);
              fetchedVideosData = formattedVideos;
            }
          } else {
            fetchedVideosData = formattedVideos;
          }
          setVideos(fetchedVideosData);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [userId, isViewOnly, currentUser]);

  useEffect(() => {
    if (isViewOnly && editorId) {
      console.log(`Portfolio.tsx: Attempting to record view for editor ID: ${editorId}. Current user: ${currentUser?.id}`);
      recordPortfolioView(editorId);
    }
  }, [isViewOnly, editorId, recordPortfolioView, currentUser?.id]);

  const moveCategory = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === allCategories.length - 1)
    ) {
      return;
    }
    
    const newCategories = [...allCategories];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const categoryToMove = newCategories[index];
    
    newCategories.splice(index, 1);
    newCategories.splice(newIndex, 0, categoryToMove);
    
    toast.success(`Category "${categoryToMove.name}" moved ${direction}`);
  }, [allCategories]);
  
  const toggleEditMode = async () => {
    if (editMode) {
      await saveChanges();
    }
    setEditMode(!editMode);
  };
  
  const saveChanges = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error(t('Portfolio.SaveChanges'));
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
        categories: prepareForDatabase(allCategories),
        featured_video: prepareForDatabase(featuredVideo),
        highlighted_videos: prepareForDatabase(highlightedVideos),
        about: about,
        specializations: specializations,
        showreel_url: showreelUrl,
        portfolio_title: portfolioTitle,
        portfolio_description: portfolioDescription,
        links: prepareForDatabase(links),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('portfolio_settings')
        .upsert(portfolioData, { onConflict: 'user_id' });
      
      if (error) {
        throw error;
      }
      
      toast.success(t('Portfolio.SaveChanges'));
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
    const loadingMessage = isViewOnly && editorId 
      ? t('Portfolio.LoadingPortfolio', { name: editorData?.name || 'editor' })
      : t('Portfolio.LoadingYourPortfolio');
    return <LoadingState message={loadingMessage} />;
  }
  
  if (isViewOnly && !editorId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="bg-card p-6 rounded-lg shadow-md mt-10">
          <h2 className="text-2xl font-bold mb-4">{t('Portfolio.EditorNotFound')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('Portfolio.EditorNotFoundDescription')}
          </p>
          <Button asChild>
            <Link to="/explore">{t('Portfolio.BrowseEditors')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isViewOnly && editorId && !editorData && !isLoading) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <div className="bg-card p-6 rounded-lg shadow-md mt-10">
          <h2 className="text-2xl font-bold mb-4">{t('Portfolio.EditorNotFound')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('Portfolio.EditorProfileNotFound', { editorId })}
          </p>
          <Button asChild>
            <Link to="/explore">{t('Portfolio.BrowseEditors')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayUser = isViewOnly ? editorData : currentUser;
  
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
                    {t('Portfolio.Saving')}
                  </>
                ) : (
                  <>
                    {t('Portfolio.SaveChanges')}
                    <Save className="ml-2 h-4 w-4" />
                  </>
                )
              ) : (
                <>
                  {t('Portfolio.EditPortfolio')}
                  <Edit className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
        
        <HeaderSection 
          featuredVideo={featuredVideo}
          currentUser={displayUser}
          editMode={editMode && !isViewOnly}
          updateVideoThumbnail={updateVideoThumbnail}
          title={portfolioTitle}
          setTitle={(title: string) => {
            setPortfolioTitle(title);
            if (!isViewOnly) updatePortfolioTitle(title);
          }}
          description={portfolioDescription}
          setDescription={setPortfolioDescription}
          isSavingTitle={isSavingTitle && !isViewOnly}
          isViewOnly={isViewOnly}
        />
        
        <section className="py-12 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <ProfileCard
                  currentUser={currentUser}
                  editorData={displayUser}
                  about={about}
                  setAbout={setAbout}
                  specializations={specializations}
                  setSpecializations={setSpecializations}
                  newSpecialization={newSpecialization}
                  setNewSpecialization={setNewSpecialization}
                  editMode={editMode && !isViewOnly}
                  aboutDialogOpen={aboutDialogOpen}
                  setAboutDialogOpen={setAboutDialogOpen}
                  specializationsDialogOpen={specializationsDialogOpen}
                  setSpecializationsDialogOpen={setSpecializationsDialogOpen}
                  handleAddSpecialization={handleAddSpecialization}
                  handleRemoveSpecialization={handleRemoveSpecialization}
                  isViewOnly={isViewOnly}
                  totalVideos={videos.length}
                />
                <CopyPortfolioLink />
                {editMode && !isViewOnly && (
                  <CategoryManager
                    userCategories={allCategories}
                    moveCategory={moveCategory}
                  />
                )}
              </div>
              
              <div className="md:w-2/3">
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="portfolio">{t('Portfolio.Portfolio')}</TabsTrigger>
                    <TabsTrigger value="links">{t('Portfolio.Links')}</TabsTrigger>
                    {highlightedVideos.length > 0 && (
                      <TabsTrigger value="highlights">{t('Portfolio.Highlights')}</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="portfolio" className="animate-fade-in opacity-0">
                    <ShowreelSection
                      showreelUrl={showreelUrl}
                      showreelThumbnail={showreelThumbnail}
                      editMode={editMode && !isViewOnly}
                    />
                    
                    <div className="mb-6">
                      <CategorySlider 
                        onSelectCategory={setSelectedCategory}
                        selectedCategoryId={selectedCategory?.id}
                        categories={allCategories}
                      />
                    </div>
                    
                    <VideoGrid
                      videos={filteredVideos}
                      editMode={editMode && !isViewOnly}
                      thumbnailOptions={thumbnailOptions}
                      updateVideoThumbnail={updateVideoThumbnail}
                      toggleHighlight={toggleHighlight}
                      setAsFeatured={setAsFeatured}
                      isViewOnly={isViewOnly}
                    />
                  </TabsContent>
                  
                  <TabsContent value="highlights" className="animate-fade-in opacity-0">
                    <VideoGrid
                      videos={highlightedVideos}
                      editMode={editMode && !isViewOnly}
                      thumbnailOptions={thumbnailOptions}
                      updateVideoThumbnail={updateVideoThumbnail}
                      toggleHighlight={toggleHighlight}
                      setAsFeatured={setAsFeatured}
                      isViewOnly={isViewOnly}
                    />
                  </TabsContent>
                  
                  <TabsContent value="links" className="animate-fade-in opacity-0">
                    <LinksTab 
                      editMode={editMode && !isViewOnly} 
                      isViewOnly={isViewOnly}
                      links={links}
                      setLinks={setLinks}
                    />
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
