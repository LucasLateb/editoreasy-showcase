
import React from 'react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/ui/sidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import CategorySlider from '@/components/CategorySlider';
import VideoCard from '@/components/VideoCard';

const Explore: React.FC = () => {
  // Sample data - in a real app, this would come from an API
  const videos = [
    {
      id: '1',
      title: 'Cinematic Travel Montage',
      editor: 'Jane Filmmaker',
      thumbnail: '/placeholder.svg',
      views: 12453,
      likes: 854,
      date: '2023-08-15',
    },
    {
      id: '2',
      title: 'Corporate Brand Video',
      editor: 'Mark Visual',
      thumbnail: '/placeholder.svg',
      views: 7823,
      likes: 421,
      date: '2023-09-02',
    },
    {
      id: '3',
      title: 'Wedding Highlights',
      editor: 'Emma Capture',
      thumbnail: '/placeholder.svg',
      views: 15932,
      likes: 1203,
      date: '2023-07-28',
    },
    {
      id: '4',
      title: 'Product Commercial',
      editor: 'Alex Editor',
      thumbnail: '/placeholder.svg',
      views: 8745,
      likes: 632,
      date: '2023-08-05',
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
