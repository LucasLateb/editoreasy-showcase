
import React, { useState } from 'react';
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

// Create a Footer component
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

// Define the appropriate video type for this page
type ExploreVideoType = {
  id: string;
  title: string;
  editor: string;
  thumbnail: string;
  views: number;
  likes: number;
  date: string;
  // Adding the missing properties to match the Video type
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
};

// Sample editor data for search
type EditorType = {
  id: string;
  name: string;
  specialization?: string;
};

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Sample data for editors - in a real app, this would come from an API
  const editors: EditorType[] = [
    { id: '1', name: 'Jane Filmmaker', specialization: 'Travel Videos' },
    { id: '2', name: 'Mark Visual', specialization: 'Corporate' },
    { id: '3', name: 'Emma Capture', specialization: 'Weddings' },
    { id: '4', name: 'Alex Editor', specialization: 'Product Videos' },
    { id: '5', name: 'Sarah Thompson', specialization: 'Music Videos' },
    { id: '6', name: 'Michael Rodriguez', specialization: 'Short Films' },
    { id: '7', name: 'David Chen', specialization: 'Documentary' },
    { id: '8', name: 'Olivia Kim', specialization: 'Animation' },
  ];

  // Filter editors based on search term
  const filteredEditors = editors.filter(editor => 
    editor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle navigation to editor profiles
  const handleEditorSelect = (editorId: string) => {
    setIsSearchOpen(false);
    navigate(`/editor/${editorId}`);
  };

  // Sample data - in a real app, this would come from an API
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
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative w-full max-w-md">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full justify-start text-left font-normal"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search for video editors...</span>
                  </Button>
                </div>
                <div className="hidden md:flex">{/* Spacer */}</div>
              </div>
              
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

      {/* Editor Search Dialog */}
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput 
          placeholder="Search for editors..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
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
                {editor.specialization && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    • {editor.specialization}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default Explore;
