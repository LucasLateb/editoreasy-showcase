
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
import { Category, categories } from '@/types';

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
  editorTier?: string;
  isHighlighted?: boolean;
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

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch videos from Supabase
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
            is_highlighted,
            profiles(name, avatar_url, subscription_tier)
          `);
        
        // Apply category filter if selected
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory.id);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Format the data to match our expected type
        const formattedVideos = data.map(video => ({
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
          editorName: video.profiles?.name || 'Unknown Editor',
          editorAvatar: video.profiles?.avatar_url || undefined,
          editorTier: video.profiles?.subscription_tier || 'free',
          isHighlighted: video.is_highlighted || false,
          editor: video.profiles?.name || 'Unknown Editor',
          thumbnail: video.thumbnail_url || '/placeholder.svg',
        }));
        
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

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
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

          {isLoadingVideos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No videos found. {selectedCategory ? 'Try selecting a different category.' : ''}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

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
