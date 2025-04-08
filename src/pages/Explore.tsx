
import React from 'react';
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

const Explore: React.FC = () => {
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
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Explore Videos</CardTitle>
              <CardDescription>
                Discover trending videos and talented editors
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
    </div>
  );
};

export default Explore;
