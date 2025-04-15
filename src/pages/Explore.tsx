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
import { Input } from '@/components/ui/input';
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
import { Video, Category, categories } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
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
};

type EditorType = {
  id: string;
  name: string | null;
  subscription_tier: string | null;
  specialization?: string;
};

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
            thumbnail_url,
            video_url,
            category_id,
            user_id,
            likes,
            views,
            created_at,
            is_highlighted
          `)
          .order('created_at', { ascending: false });
        
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory.id);
        }
        
        const { data: videoData, error: videoError } = await query;
        
        if (videoError) {
          throw videoError;
        }

        const formattedVideos: Video[] = await Promise.all(
          videoData.map(async (video) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, avatar_url, subscription_tier')
              .eq('id', video.user_id)
              .single();
            
            return {
              id: video.id,
              title: video.title,
              description: video.description || '',
              thumbnailUrl: video.thumbnail_url || '/placeholder.svg',
              videoUrl: video.video_url || '',
              categoryId: video.category_id,
              userId: video.user_id,
              likes: video.likes || 0,
              views: video.views || 0,
              createdAt: new Date(video.created_at),
              isHighlighted: video.is_highlighted || false,
              editorName: profileData?.name || 'Unknown Editor',
              editorAvatar: profileData?.avatar_url || '',
              editorTier: (profileData?.subscription_tier as 'free' | 'premium' | 'pro') || 'free'
            };
          })
        );
        
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
  }, [toast, selectedCategory]);

  useEffect(() => {
    const fetchEditors = async () => {
      setIsLoadingEditors(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, subscription_tier')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        const editorsData = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unnamed Editor',
          subscription_tier: profile.subscription_tier
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
  }, [toast]);

  const filteredEditors = editors.filter(editor => 
    editor.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditorSelect = (editorId: string) => {
    setIsSearchOpen(false);
    navigate(`/editor/${editorId}`);
  };

  const handleCategorySelect = (category: Category | undefined) => {
    setSelectedCategory(category || null);
  };

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

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
              <CategorySlider 
                onSelectCategory={handleCategorySelect}
                selectedCategoryId={selectedCategory?.id}
              />
            </CardContent>
          </Card>

          {isLoadingVideos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="w-full aspect-video rounded-lg" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                {selectedCategory 
                  ? `No videos available in the ${selectedCategory.name} category.` 
                  : 'There are no videos available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div key={video.id} onClick={() => handleVideoClick(video)}>
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {selectedVideo && (
        <VideoPlayerDialog
          isOpen={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
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
