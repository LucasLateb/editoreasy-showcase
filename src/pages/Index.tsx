import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import EditorCard from '@/components/EditorCard';
import VideoCard from '@/components/VideoCard';
import PricingPlans from '@/components/PricingPlans';
import SEO from '@/components/SEO';
import { Toaster } from '@/components/Toaster';
import { User as AppUser } from '@/types';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from '@/components/ui/pagination';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import SpecializationFilter from '@/components/SpecializationFilter';
import { Search, User as LucideUserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useToast } from '@/hooks/use-toast';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';
import { getVideoAspectRatio } from '@/utils/videoHelpers';

// Define a more specific type for editors, including totalVideoLikes
type EditorProfile = AppUser & { totalVideoLikes: number };

const Index: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<any>(undefined);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [popularEditors, setPopularEditors] = useState<EditorProfile[]>([]);
  const [filteredEditors, setFilteredEditors] = useState<EditorProfile[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [showreelData, setShowreelData] = useState<{[key: string]: {
    url?: string, 
    thumbnail?: string, 
    about?: string,
    specializations?: string[]
  }}>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allEditors, setAllEditors] = useState<any[]>([]);
  const [isLoadingAllEditors, setIsLoadingAllEditors] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Utiliser le hook avec toutes les vidéos SEULEMENT quand elles sont chargées
  // Ne filtrer pour afficher uniquement les catégories avec des vidéos que si les vidéos sont chargées
  const { categories, getCategoryById } = useCategoriesWithFallback(
    !isVideosLoading ? allVideos : undefined, 
    !isVideosLoading && allVideos.length > 0
  );
  
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };
  
  const handleEditorSelect = (editorId: string) => {
    setIsSearchOpen(false);
    navigate(`/editor/${editorId}`);
  };
  
  const filteredSearchEditors = allEditors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchAllEditors = async () => {
      setIsLoadingAllEditors(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, subscription_tier, role')
          .eq('role', 'monteur') 
          .order('name');
        
        if (error) {
          throw error;
        }
        
        const editorsData = data.map(profile => ({
          id: profile.id,
          name: profile.name || t('Errors.NoEditorsFound'),
          subscription_tier: profile.subscription_tier,
          role: profile.role
        }));
        
        setAllEditors(editorsData);
      } catch (error) {
        console.error('Error fetching all editors:', error);
        toast({
          title: t('Errors.FailedToLoadEditors'),
          description: t('Errors.CouldNotRetrieveEditors'),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAllEditors(false);
      }
    };

    fetchAllEditors();
  }, [toast, t]);
  
  useEffect(() => {
    const fetchPopularEditors = async () => {
      setIsLoading(true);
      try {
        const { data: proEditorsData, error: editorsError } = await supabase
          .from('profiles')
          .select('id, name, email, avatar_url, created_at, subscription_tier, likes, bio')
          .eq('role', 'monteur')
          .eq('subscription_tier', 'pro');
        
        if (editorsError) {
          console.error('Error fetching pro editors:', editorsError);
          toast({ title: "Erreur", description: "Impossible de récupérer les éditeurs Pro.", variant: "destructive" });
          setPopularEditors([]);
          setIsLoading(false);
          return;
        }

        if (!proEditorsData || proEditorsData.length === 0) {
          setPopularEditors([]);
          setShowreelData({});
          setAvailableSpecializations([]);
          setIsLoading(false);
          return;
        }

        const editorIds = proEditorsData.map(editor => editor.id);
        const { data: videoLikesData, error: videoLikesError } = await supabase
          .from('videos')
          .select('user_id, likes')
          .in('user_id', editorIds);
            
        if (videoLikesError) {
          console.error('Error fetching video likes:', videoLikesError);
        }
        
        const totalLikesByEditor: {[key: string]: number} = videoLikesData?.reduce((acc: {[key: string]: number}, video) => {
          acc[video.user_id] = (acc[video.user_id] || 0) + (video.likes || 0);
          return acc;
        }, {}) || {};
        
        const editorsWithVideoLikes: EditorProfile[] = proEditorsData.map(editor => ({
          id: editor.id,
          name: editor.name || 'Éditeur inconnu',
          email: editor.email || undefined,
          avatarUrl: editor.avatar_url,
          bio: editor.bio,
          subscriptionTier: editor.subscription_tier as 'pro',
          likes: editor.likes || 0,
          createdAt: new Date(editor.created_at),
          totalVideoLikes: totalLikesByEditor[editor.id] || 0,
          role: 'monteur',
        }));
        
        const sortedProEditors = editorsWithVideoLikes.sort((a, b) => b.totalVideoLikes - a.totalVideoLikes);
        const top4ProEditors = sortedProEditors.slice(0, 4);
        setPopularEditors(top4ProEditors);
        
        if (top4ProEditors.length > 0) {
          const top4EditorIds = top4ProEditors.map(editor => editor.id);
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio_settings')
            .select('user_id, showreel_url, showreel_thumbnail, about, specializations')
            .in('user_id', top4EditorIds);
          
          if (portfolioError) {
            console.error('Error fetching portfolio settings:', portfolioError);
          } else if (portfolioData) {
            const showreelMap: {[key: string]: { url?: string, thumbnail?: string, about?: string, specializations?: string[] }} = {};
            const allSpecializations = new Set<string>();
            
            portfolioData.forEach(item => {
              let specializationsArray: string[] = [];
              if (item.specializations) {
                try {
                  if (typeof item.specializations === 'string') {
                    specializationsArray = JSON.parse(item.specializations);
                  } else if (Array.isArray(item.specializations)) {
                    specializationsArray = (item.specializations as any[]).map(spec => 
                      typeof spec === 'string' ? spec : String(spec)
                    );
                  }
                  specializationsArray.forEach(spec => allSpecializations.add(spec));
                } catch (e) { console.error('Error parsing specializations for showreelMap:', e); }
              }
              showreelMap[item.user_id] = {
                url: item.showreel_url || undefined,
                thumbnail: item.showreel_thumbnail || undefined,
                about: item.about || undefined,
                specializations: specializationsArray
              };
            });
            setShowreelData(showreelMap);
            setAvailableSpecializations(Array.from(allSpecializations).sort());
          }
        } else {
          setShowreelData({});
          setAvailableSpecializations([]);
        }

      } catch (error) {
        console.error('Error in fetchPopularEditors:', error);
        toast({ title: "Erreur", description: "Une erreur inattendue est survenue.", variant: "destructive" });
        setPopularEditors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularEditors();
  }, [toast]);
  
  useEffect(() => {
    if (selectedSpecialization) {
      const filtered = popularEditors.filter(editor => {
        const editorSpecializations = showreelData[editor.id]?.specializations || [];
        return editorSpecializations.includes(selectedSpecialization);
      });
      setFilteredEditors(filtered);
    } else {
      setFilteredEditors(popularEditors);
    }
  }, [popularEditors, selectedSpecialization, showreelData]);
  
  useEffect(() => {
    const fetchVideos = async () => {
      setIsVideosLoading(true);
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }
        
        const profileMap = new Map();
        profiles.forEach((profile) => {
          profileMap.set(profile.id, {
            tier: profile.subscription_tier || 'free',
            name: profile.name || 'Unknown Editor',
            avatar: profile.avatar_url
          });
        });
        
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*');
        
        if (videosError) {
          console.error('Error fetching videos:', videosError);
          return;
        }
        
        if (videosData) {
          const processedVideos = videosData.map(video => {
            const profileInfo = profileMap.get(video.user_id) || { 
              tier: 'free', 
              name: 'Unknown Editor',
              avatar: null
            };
            
            return {
              id: video.id,
              title: video.title,
              description: video.description || '',
              thumbnailUrl: video.thumbnail_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
              videoUrl: video.video_url || '#',
              categoryId: video.category_id,
              userId: video.user_id,
              editorName: profileInfo.name,
              editorAvatar: profileInfo.avatar,
              editorTier: profileInfo.tier,
              likes: video.likes || 0,
              views: video.views || 0,
              createdAt: new Date(video.created_at),
              isHighlighted: video.is_highlighted || false
            };
          });
          
          const sortedVideos = processedVideos.sort((a, b) => {
            if (a.editorTier === 'pro' && b.editorTier !== 'pro') return -1;
            if (a.editorTier !== 'pro' && b.editorTier === 'pro') return 1;
            if (a.isHighlighted && !b.isHighlighted) return -1;
            if (!a.isHighlighted && b.isHighlighted) return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          }).slice(0, 30);
          
          setAllVideos(sortedVideos);
          
          // Filtrer selon la catégorie sélectionnée
          if (selectedCategory) {
            const filteredVideos = sortedVideos.filter(video => video.categoryId === selectedCategory.id);
            setVideos(filteredVideos);
          } else {
            setVideos(sortedVideos);
          }
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsVideosLoading(false);
      }
    };
    
    fetchVideos();
  }, []);

  // Effet séparé pour filtrer les vidéos quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      const filteredVideos = allVideos.filter(video => video.categoryId === selectedCategory.id);
      setVideos(filteredVideos);
    } else {
      setVideos(allVideos);
    }
  }, [selectedCategory, allVideos]);

  // Structured data for the homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VideoCut",
    "url": "https://videocut.lovable.app",
    "description": "Plateforme portfolio pour éditeurs vidéo professionnels permettant aux monteurs de présenter leurs travaux et aux clients de trouver des créateurs talentueux.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": "Accès gratuit à la plateforme avec options premium disponibles"
    },
    "featureList": [
      "Portfolios d'éditeurs vidéo",
      "Galerie de vidéos créatives",
      "Recherche de monteurs professionnels",
      "Catégories de contenu spécialisées"
    ]
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <SEO
          title="VideoCut - Plateforme Portfolio pour Éditeurs Vidéo | Monteurs Professionnels"
          description="Découvrez des monteurs vidéo professionnels, explorez leurs portfolios créatifs et trouvez le créateur parfait pour vos projets. Plateforme de référence pour éditeurs vidéo."
          keywords="éditeur vidéo, monteur vidéo, portfolio vidéo, création vidéo, montage professionnel, vidéaste, post-production, créateur contenu"
          structuredData={structuredData}
        />
        
        <Navbar />
        <Toaster />
        
        <main>
          <Hero />
          
          <section className="py-16 px-8 sm:px-10 lg:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-3">{t('HomePage.PopularEditors')}</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('HomePage.PopularEditorsDescription')}
              </p>
            </div>
            
            {!isLoading && availableSpecializations.length > 0 && popularEditors.length > 0 && (
              <div className="px-4">
                <SpecializationFilter
                  availableSpecializations={availableSpecializations}
                  selectedSpecialization={selectedSpecialization}
                  onSelectSpecialization={setSelectedSpecialization}
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 rounded-t-lg overflow-visible pt-4 px-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-5 rounded-2xl bg-background border border-border animate-pulse min-h-[350px]">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-muted"></div>
                      <div className="ml-3">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-3 w-32 bg-muted rounded mt-2"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded mb-3"></div>
                    <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                    <div className="h-[120px] w-full bg-muted rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 w-16 bg-muted rounded"></div>
                      <div className="flex gap-2">
                        <div className="h-8 w-20 bg-muted rounded"></div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : filteredEditors.length > 0 ? (
                filteredEditors.map((editor, index) => {
                  const showreelInfo = showreelData[editor.id] || {};
                  const editorForCard: AppUser & { totalVideoLikes?: number } = {
                    ...editor,
                    email: editor.email || undefined, 
                    role: editor.role || 'monteur', 
                    favoritedAt: editor.favoritedAt || undefined,
                  };
                  return (
                    <EditorCard 
                      key={editor.id} 
                      editor={editorForCard} 
                      index={index}
                      showreelUrl={showreelInfo.url}
                      showreelThumbnail={showreelInfo.thumbnail}
                      about={showreelInfo.about}
                      specializations={showreelInfo.specializations}
                    />
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center">
                  <h3 className="text-lg font-medium mb-2">{t('HomePage.NoEditorsFound')}</h3>
                  <p className="text-muted-foreground">
                    {selectedSpecialization 
                      ? t('HomePage.NoEditorsFoundDescription')
                      : t('HomePage.NoEditorsFoundGeneral')
                    }
                  </p>
                </div>
              )}
            </div>
          </section>
          
          <div className="bg-muted/30 py-12 border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-2">{t('HomePage.FindVideoEditors')}</h2>
                <p className="text-muted-foreground mb-6">
                  {t('HomePage.FindVideoEditorsDescription')}
                </p>
                <div className="w-full max-w-md">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full justify-start text-left font-normal 
                      border-primary/20 hover:border-primary 
                      bg-white/10 backdrop-blur-sm 
                      transition-all duration-300 
                      hover:bg-primary/5 
                      hover:shadow-sm 
                      group"
                  >
                    <Search className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {t('HomePage.SearchPlaceholder')}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <section className="py-16 px-8 sm:px-10 lg:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">{t('HomePage.BrowseCategories')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t('HomePage.BrowseCategoriesDescription')}
              </p>
            </div>
            
            <div className="px-4">
              <CategorySlider 
                onSelectCategory={setSelectedCategory}
                selectedCategoryId={selectedCategory?.id}
                categories={categories}
              />
            </div>
            
            <div className="mt-8 px-4">
              {isVideosLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 rounded-b-lg overflow-visible pb-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : videos.length > 0 ? (
                (() => {
                  // Group videos by aspect ratio
                  const verticalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'vertical');
                  const horizontalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'horizontal');
                  
                  return (
                    <div className="flex gap-6">
                      {/* Left side: Horizontal videos in grid */}
                      <div className="flex-1">
                        {horizontalVideos.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {horizontalVideos.map((video) => (
                              <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer">
                                <VideoCard video={video} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Right side: Vertical videos in single column */}
                      {verticalVideos.length > 0 && (
                        <div className="w-[300px] flex-shrink-0">
                          <div className="space-y-4">
                            {verticalVideos.map((video) => (
                              <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer">
                                <VideoCard video={video} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="col-span-3 py-12 text-center">
                  <h3 className="text-lg font-medium mb-2">{t('HomePage.NoVideosFound')}</h3>
                  <p className="text-muted-foreground">
                    {t('HomePage.NoVideosFoundDescription')}
                  </p>
                </div>
              )}
            </div>
            
            {videos.length > 0 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </section>
          
          <PricingPlans />
          
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">{t('HomePage.ReadyToShowcase')}</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                {t('HomePage.ReadyToShowcaseDescription')}
              </p>
              <div className="inline-block rounded-full bg-primary/10 p-1 backdrop-blur-sm animate-pulse-subtle">
                <button className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  {t('HomePage.GetStartedToday')}
                </button>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="bg-secondary py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">{t('VideoCut')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('HomePage.Footer.Description')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">{t('HomePage.Footer.Product')}</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/features" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Features')}</Link></li>
                  <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Pricing')}</Link></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Testimonials')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">{t('HomePage.Footer.Resources')}</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Blog')}</Link></li>
                  <li><Link to="/community" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Community')}</Link></li>
                  <li><Link to="/support" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Support')}</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">{t('HomePage.Footer.Company')}</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/about" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.About')}</Link></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Careers')}</a></li>
                  <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">{t('HomePage.Footer.Contact')}</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p>{t('HomePage.Footer.Copyright')}</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <Link to="/terms" className="hover:text-foreground">{t('HomePage.Footer.Terms')}</Link>
                  <Link to="/privacy" className="hover:text-foreground">{t('HomePage.Footer.Privacy')}</Link>
                  <Link to="/cookies" className="hover:text-foreground">{t('HomePage.Footer.Cookies')}</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
        
        {selectedVideo && (
          <VideoPlayerDialog
            isOpen={isVideoDialogOpen}
            onClose={() => setIsVideoDialogOpen(false)}
            videoUrl={selectedVideo.videoUrl}
            title={selectedVideo.title}
            videoId={selectedVideo.id}
            description={selectedVideo.description}
            editorId={selectedVideo.userId}
            editorName={selectedVideo.editorName}
            editorAvatar={selectedVideo.editorAvatar}
          />
        )}
        
        <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <CommandInput 
            placeholder={t('HomePage.SearchPlaceholder')}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoadingAllEditors ? (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">{t('Loading')}</p>
              </div>
            ) : (
              <>
                <CommandEmpty>{t('Errors.NoEditorsFound')}</CommandEmpty>
                <CommandGroup heading="Editors">
                  {filteredSearchEditors.map((editor) => (
                    <CommandItem
                      key={editor.id}
                      onSelect={() => handleEditorSelect(editor.id)}
                      className="flex items-center"
                    >
                      <LucideUserIcon className="mr-2 h-4 w-4" />
                      <span>{editor.name}</span>
                      {editor.subscription_tier && editor.subscription_tier !== 'free' && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          • {editor.subscription_tier.charAt(0).toUpperCase() + editor.subscription_tier.slice(1)}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>
      </div>
    </HelmetProvider>
  );
};

export default Index;
