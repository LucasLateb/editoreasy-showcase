
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import CategorySlider from '@/components/CategorySlider';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Search, Users, VideoIcon, UserSquare2 } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ExploreEditorCard, { ExploreEditorCardData } from '@/components/ExploreEditorCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category, Video as VideoType, categories as localCategories } from '@/types';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';

const Footer = () => {
  return (
    <footer className="bg-background py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 VideoEditPro. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

type ExploreVideoType = {
  id: string;
  title: string;
  editor: string;
  thumbnail: string;
  views: number;
  likes: number;
  date: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
  editorName?: string;
  editorAvatar?: string;
  editorTier?: 'free' | 'premium' | 'pro';
  isHighlighted?: boolean;
};

type EditorProfileType = {
  id: string;
  name: string | null;
  avatar_url?: string | null;
  subscription_tier: string | null;
  role?: string;
  specializations?: string[] | null;
  showreel_url?: string | null;
  showreel_thumbnail?: string | null;
  about?: string | null;
};

// Function to sort by subscription tier priority
const sortBySubscriptionTier = (a: any, b: any) => {
  const tierOrder = { 'pro': 3, 'premium': 2, 'free': 1 };
  const aTier = tierOrder[a.editorTier] || tierOrder[a.subscription_tier] || 0;
  const bTier = tierOrder[b.editorTier] || tierOrder[b.subscription_tier] || 0;
  
  if (aTier !== bTier) {
    return bTier - aTier; // Higher tier first
  }
  
  // If same tier, sort by creation date (newest first)
  return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
};

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorProfileType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [allVideos, setAllVideos] = useState<VideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  // Use the hook with all videos for categories, ensuring categories are always available
  const { categories: availableCategories, isLoading: categoriesLoading } = useCategoriesWithFallback(
    allVideos.length > 0 ? allVideos : undefined, 
    !isLoadingVideos && allVideos.length > 0
  );

  useEffect(() => {
    const fetchAllVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const { data: videoData, error: videoError } = await supabase
          .from('videos')
          .select(`
            id, 
            title, 
            description, 
            video_url, 
            thumbnail_url, 
            views, 
            likes, 
            category_id, 
            user_id, 
            created_at,
            is_highlighted
          `)
          .order('created_at', { ascending: false });
        
        if (videoError) {
          throw videoError;
        }

        if (!videoData || videoData.length === 0) {
          setAllVideos([]);
          setVideos([]);
          setIsLoadingVideos(false);
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id).filter(id => id))];
        
        let profilesMap: Record<string, any> = {};
        if (userIds.length > 0) {
          try {
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, name, avatar_url, subscription_tier')
              .in('id', userIds);
              
            if (!profilesError && profilesData) {
              profilesMap = profilesData.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
              }, {});
            }
          } catch (profileError) {
            console.warn('Failed to fetch profiles, continuing without profile data:', profileError);
          }
        }
        
        const formattedVideos = videoData.map(video => {
          const profile = profilesMap[video.user_id] || {};
          
          let editorTier: 'free' | 'premium' | 'pro' = 'free';
          if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
            editorTier = profile.subscription_tier as 'premium' | 'pro';
          }
          
          return {
            id: video.id,
            title: video.title,
            description: video.description,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url || '/placeholder.svg',
            views: video.views || 0,
            likes: video.likes || 0,
            categoryId: video.category_id,
            userId: video.user_id,
            createdAt: new Date(video.created_at),
            editorName: profile.name || 'Unknown Editor',
            editorAvatar: profile.avatar_url || undefined,
            editorTier: editorTier,
            isHighlighted: video.is_highlighted || false,
          } as VideoType;
        });
        
        // Sort videos by subscription tier priority
        const sortedVideos = formattedVideos.sort(sortBySubscriptionTier);
        
        setAllVideos(sortedVideos);
        
        // Filter by selected category
        if (selectedCategory) {
          const filteredVideos = sortedVideos.filter(video => video.categoryId === selectedCategory.id);
          setVideos(filteredVideos);
        } else {
          setVideos(sortedVideos);
        }
        
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: 'Failed to load videos',
          description: 'Could not retrieve videos from the database.',
          variant: 'destructive',
        });
        setAllVideos([]);
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchAllVideos();
  }, [toast]);

  // Filter videos when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filteredVideos = allVideos.filter(video => video.categoryId === selectedCategory.id);
      // Apply sorting by tier even after filtering
      const sortedFilteredVideos = filteredVideos.sort(sortBySubscriptionTier);
      setVideos(sortedFilteredVideos);
    } else {
      // Apply sorting by tier to all videos
      const sortedVideos = [...allVideos].sort(sortBySubscriptionTier);
      setVideos(sortedVideos);
    }
  }, [selectedCategory, allVideos]);

  useEffect(() => {
    const fetchEditorProfiles = async () => {
      setIsLoadingEditors(true);
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier, role')
          .eq('role', 'monteur')
          .order('name');

        if (profilesError) throw profilesError;
        if (!profilesData) {
          setEditors([]);
          setIsLoadingEditors(false);
          return;
        }

        const editorIds = profilesData.map(p => p.id);
        let portfolioSettingsMap: Record<string, any> = {};

        if (editorIds.length > 0) {
          const { data: settingsData, error: settingsError } = await supabase
            .from('portfolio_settings')
            .select('user_id, specializations, showreel_url, showreel_thumbnail, about')
            .in('user_id', editorIds);

          if (settingsError) {
            console.error('Error fetching portfolio settings:', settingsError);
          } else if (settingsData) {
            portfolioSettingsMap = settingsData.reduce((acc, setting) => {
              acc[setting.user_id] = setting;
              return acc;
            }, {});
          }
        }
        
        const combinedEditorsData = profilesData.map(profile => {
          const settings = portfolioSettingsMap[profile.id] || {};
          return {
            id: profile.id,
            name: profile.name || 'Unnamed Editor',
            avatar_url: profile.avatar_url,
            subscription_tier: profile.subscription_tier,
            role: profile.role,
            specializations: settings.specializations || [],
            showreel_url: settings.showreel_url,
            showreel_thumbnail: settings.showreel_thumbnail,
            about: settings.about || null,
          };
        });
        
        // Sort editors by subscription tier priority
        const sortedEditors = combinedEditorsData.sort(sortBySubscriptionTier);
        
        setEditors(sortedEditors);
      } catch (error) {
        console.error('Error fetching editor profiles:', error);
        toast({
          title: 'Failed to load editor profiles',
          description: (error as Error).message || 'Could not retrieve editor profiles.',
          variant: 'destructive',
        });
        setEditors([]);
      } finally {
        setIsLoadingEditors(false);
      }
    };
    fetchEditorProfiles();
  }, [toast]);

  const filteredCommandEditors = editors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditorSelectCommand = (editorId: string) => {
    setIsSearchOpen(false);
    navigate(`/editor/${editorId}`);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setActiveTab("videos"); // Switch to videos tab when a category is selected
  };

  const handleVideoClick = (video: VideoType) => { 
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const transformEditorDataForCard = (editor: EditorProfileType): ExploreEditorCardData => ({
    id: editor.id,
    name: editor.name || 'Unnamed Editor',
    avatarUrl: editor.avatar_url,
    specializations: editor.specializations || [],
    showreelUrl: editor.showreel_url,
    showreelThumbnail: editor.showreel_thumbnail,
    about: editor.about || null, // S'assurer que about est transmis
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Explore Content</CardTitle>
              <CardDescription>
                Discover trending videos and talented editors.
                {!isAuthenticated && (
                  <span className="block text-sm mt-1 text-primary">
                    Sign in to interact.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <CategorySlider 
                  onSelectCategory={handleCategorySelect}
                  selectedCategoryId={activeTab === 'videos' ? selectedCategory?.id : undefined}
                  categories={availableCategories}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4 shrink-0"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Editors
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" /> Videos
                  </TabsTrigger>
                  <TabsTrigger value="editors" className="flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4" /> Editors
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="videos">
                  {isLoadingVideos ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No videos found. {selectedCategory ? 'Try selecting a different category or clearing the filter.' : ''}</p>
                       {selectedCategory && (
                        <Button variant="link" onClick={() => { setSelectedCategory(null); setActiveTab("videos"); }}>Clear category filter</Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {videos.map((video) => (
                        <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer">
                          <VideoCard video={video} />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="editors">
                  {isLoadingEditors ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : editors.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No editors found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {editors.map((editor) => (
                        <ExploreEditorCard key={editor.id} editor={transformEditorDataForCard(editor)} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

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
          placeholder="Search for editors..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          {isLoadingEditors ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">Loading editors...</p>
            </div>
          ) : (
            <>
              <CommandEmpty>No editors found.</CommandEmpty>
              <CommandGroup heading="Editors">
                {filteredCommandEditors.map((editor) => (
                  <CommandItem
                    key={editor.id}
                    onSelect={() => handleEditorSelectCommand(editor.id)}
                    className="flex items-center cursor-pointer"
                  >
                    <Users className="mr-2 h-4 w-4" />
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
  );
};

export default Explore;
