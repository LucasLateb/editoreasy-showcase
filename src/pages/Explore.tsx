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
import { Category, Video as VideoType, categories } from '@/types';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';

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

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorProfileType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        let query = supabase
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
          `);
        
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory.id);
        }
        
        const { data: videoData, error: videoError } = await query.order('created_at', { ascending: false });
        
        if (videoError) {
          throw videoError;
        }

        if (!videoData || videoData.length === 0) {
          setVideos([]);
          setIsLoadingVideos(false);
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles for videos:', profilesError);
          setVideos([]);
          setIsLoadingVideos(false);
          return;
        }
        
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
        
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
            date: new Date(video.created_at).toISOString().split('T')[0],
            editorName: profile.name || 'Unknown Editor',
            editorAvatar: profile.avatar_url || undefined,
            editorTier: editorTier,
            isHighlighted: video.is_highlighted || false,
            editor: profile.name || 'Unknown Editor',
            thumbnail: video.thumbnail_url || '/placeholder.svg',
          };
        });
        
        setVideos(formattedVideos);
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: 'Failed to load videos',
          description: 'Could not retrieve videos from the database.',
          variant: 'destructive',
        });
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [toast, selectedCategory]);

  useEffect(() => {
    const fetchEditorProfiles = async () => {
      setIsLoadingEditors(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            avatar_url,
            subscription_tier,
            role,
            portfolio_settings (
              specializations,
              showreel_url,
              showreel_thumbnail,
              about
            )
          `)
          .eq('role', 'monteur')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        const editorsData = data.map(profile => {
          const settings = Array.isArray(profile.portfolio_settings) 
                           ? profile.portfolio_settings[0] 
                           : profile.portfolio_settings;

          return {
            id: profile.id,
            name: profile.name || 'Unnamed Editor',
            avatar_url: profile.avatar_url,
            subscription_tier: profile.subscription_tier,
            role: profile.role,
            specializations: settings?.specializations || [],
            showreel_url: settings?.showreel_url,
            showreel_thumbnail: settings?.showreel_thumbnail,
            about: settings?.about,
          };
        });
        
        setEditors(editorsData);
      } catch (error) {
        console.error('Error fetching editor profiles:', error);
        toast({
          title: 'Failed to load editor profiles',
          description: 'Could not retrieve editor profiles from the database.',
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
    setActiveTab("videos");
  };

  const handleVideoClick = (video: ExploreVideoType) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const transformEditorDataForCard = (editor: EditorProfileType): ExploreEditorCardData => ({
    id: editor.id,
    name: editor.name,
    avatarUrl: editor.avatar_url,
    specializations: editor.specializations,
    showreelUrl: editor.showreel_url,
    showreelThumbnail: editor.showreel_thumbnail,
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
                        <Button variant="link" onClick={() => setSelectedCategory(null)}>Clear category filter</Button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {videos.map((video) => (
                        <div key={video.id} onClick={() => handleVideoClick(video)}>
                          <VideoCard video={video as unknown as VideoType} />
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
                  ) : displayEditors.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No editors found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayEditors.map((editor) => (
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
                    className="flex items-center"
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
