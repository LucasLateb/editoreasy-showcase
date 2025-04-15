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

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);

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

  const videos: ExploreVideoType[] = [
    {
      id: '1',
      title: 'Cinematic Travel Montage',
      editor: 'Jane Filmmaker',
      thumbnail: '/placeholder.svg',
      views: 12453,
      likes: 854,
      date: '2023-08-15',
      description: 'A breathtaking journey through exotic locations',
      thumbnailUrl: '/placeholder.svg',
      videoUrl: 'https://example.com/video1',
      categoryId: '2',
      userId: '1',
      createdAt: new Date('2023-08-15')
    },
    {
      id: '2',
      title: 'Corporate Brand Video',
      editor: 'Mark Visual',
      thumbnail: '/placeholder.svg',
      views: 7823,
      likes: 421,
      date: '2023-09-02',
      description: 'Professional corporate promo video',
      thumbnailUrl: '/placeholder.svg',
      videoUrl: 'https://example.com/video2',
      categoryId: '1',
      userId: '2',
      createdAt: new Date('2023-09-02')
    },
    {
      id: '3',
      title: 'Wedding Highlights',
      editor: 'Emma Capture',
      thumbnail: '/placeholder.svg',
      views: 15932,
      likes: 1203,
      date: '2023-07-28',
      description: 'Beautiful wedding day highlights',
      thumbnailUrl: '/placeholder.svg',
      videoUrl: 'https://example.com/video3',
      categoryId: '3',
      userId: '3',
      createdAt: new Date('2023-07-28')
    },
    {
      id: '4',
      title: 'Product Commercial',
      editor: 'Alex Editor',
      thumbnail: '/placeholder.svg',
      views: 8745,
      likes: 632,
      date: '2023-08-05',
      description: 'Sleek product demonstration video',
      thumbnailUrl: '/placeholder.svg',
      videoUrl: 'https://example.com/video4',
      categoryId: '1',
      userId: '4',
      createdAt: new Date('2023-08-05')
    },
  ];

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
              <CategorySlider />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
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