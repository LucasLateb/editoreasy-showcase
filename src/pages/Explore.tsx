
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
import { Search, Users } from 'lucide-react';
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
import SpecializationFilter from '@/components/SpecializationFilter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Category, Video, categories } from '@/types';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { Skeleton } from '@/components/ui/skeleton';

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

type EditorType = {
  id: string;
  name: string | null;
  subscription_tier: string | null;
  role?: string;
  specialization?: string;
};

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Set a flag to prevent multiple re-renders during initial page load
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Skip fetch on initial render to prevent layout shifting

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
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: 'Failed to load videos',
            description: 'Could not retrieve videos from the database.',
            variant: 'destructive',
          });
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
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchVideos();
  }, [toast, selectedCategory, isInitialLoad]);

  useEffect(() => {
    if (isInitialLoad) return; // Skip fetch on initial render

    const fetchEditors = async () => {
      setIsLoadingEditors(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, subscription_tier, role')
          .eq('role', 'monteur') // Only fetch editors (monteurs), not clients
          .order('name');
        
        if (error) {
          throw error;
        }
        
        const editorsData = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unnamed Editor',
          subscription_tier: profile.subscription_tier,
          role: profile.role
        }));
        
        setEditors(editorsData);
      } catch (error) {
        console.error('Error fetching editors:', error);
        toast({
          title: 'Failed to load editors',
          description: 'Could not retrieve editor profiles from the database.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEditors(false);
      }
    };

    fetchEditors();
  }, [toast, isInitialLoad]);

  const filteredEditors = editors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditorSelect = (editorId: string) => {
    setIsSearchOpen(false);
    navigate(`/editor/${editorId}`);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleVideoClick = (video: ExploreVideoType) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  // Loading skeletons for videos
  const VideoSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No videos found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {selectedCategory 
          ? `No videos available for the "${selectedCategory.name}" category.`
          : "No videos available yet. Check back later or try a different search."}
      </p>
      {selectedCategory && (
        <Button variant="outline" onClick={() => setSelectedCategory(null)}>
          Show all videos
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Explore Videos</CardTitle>
              <CardDescription>
                Discover trending videos and talented editors
                {!isAuthenticated && (
                  <span className="block text-sm mt-1 text-primary">
                    Sign in to like videos and interact with editors
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex-grow">
                  <CategorySlider 
                    onSelectCategory={handleCategorySelect}
                    selectedCategoryId={selectedCategory?.id}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Editors
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content area with minimum height to prevent layout shifts */}
          <div className="min-h-[60vh]">
            {isLoadingVideos ? (
              <VideoSkeletons />
            ) : videos.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <div key={video.id} onClick={() => handleVideoClick(video)}>
                    <VideoCard video={video as Video} />
                  </div>
                ))}
              </div>
            )}
          </div>
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
                {filteredEditors.map((editor) => (
                  <CommandItem
                    key={editor.id}
                    onSelect={() => handleEditorSelect(editor.id)}
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
