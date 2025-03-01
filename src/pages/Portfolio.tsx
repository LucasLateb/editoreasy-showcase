
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import CategorySlider from '@/components/CategorySlider';
import VideoCard from '@/components/VideoCard';
import { Category, categories } from '@/types';
import { Heart, Eye, Mail, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock videos for portfolio
const mockPortfolioVideos = Array(12).fill(null).map((_, i) => ({
  id: `portfolio-video-${i}`,
  title: `${categories[i % categories.length].name} Project ${i + 1}`,
  description: 'Professional video editing project showcasing my skills.',
  thumbnailUrl: `https://images.unsplash.com/photo-${1550745165 + i * 10}-9bc0b252726f`,
  videoUrl: '#',
  categoryId: categories[i % categories.length].id,
  userId: '123', // Current user's ID
  likes: Math.floor(Math.random() * 50),
  views: Math.floor(Math.random() * 500),
  createdAt: new Date()
}));

// Featured video
const featuredVideo = {
  id: 'featured',
  title: 'Cinematic Brand Commercial',
  description: 'A high-impact commercial video created for a luxury brand with cinematic visuals and professional color grading.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  videoUrl: '#',
  categoryId: '2', // Cinematic
  userId: '123',
  likes: 137,
  views: 1243,
  createdAt: new Date()
};

const Portfolio: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  
  // Get videos filtered by category if one is selected
  const filteredVideos = selectedCategory 
    ? mockPortfolioVideos.filter(video => video.categoryId === selectedCategory.id)
    : mockPortfolioVideos;
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Featured video/header section */}
        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt="Featured work" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-16">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.2s' }}>
                  {currentUser?.name || 'Video Editor'} Portfolio
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-in-down opacity-0" style={{ animationDelay: '0.4s' }}>
                  {currentUser?.bio || 'Professional video editor specializing in cinematic visuals, motion graphics, and compelling storytelling.'}
                </p>
                
                <div className="flex flex-wrap gap-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.6s' }}>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Play className="h-4 w-4" />
                    <span>Featured Work</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Heart className="h-4 w-4" />
                    <span>{featuredVideo.likes} Likes</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                    <Eye className="h-4 w-4" />
                    <span>{featuredVideo.views} Views</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Info section */}
        <section className="py-12 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-1/3">
                <div className="bg-background rounded-2xl shadow-sm p-6 border border-border">
                  <div className="flex items-center mb-6">
                    <Avatar className="h-16 w-16 mr-4 border-2 border-background shadow-sm">
                      <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} />
                      <AvatarFallback className="text-lg">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-medium">{currentUser?.name || 'Video Editor'}</h2>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="mr-2">
                          {currentUser?.subscriptionTier.charAt(0).toUpperCase() + currentUser?.subscriptionTier.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {currentUser?.likes || 0} likes
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {currentUser?.bio || 'Professional video editor with expertise in various styles and techniques.'}
                    </p>
                    
                    <h3 className="font-medium mb-2">Specializations</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="secondary">Cinematic</Badge>
                      <Badge variant="secondary">Motion Graphics</Badge>
                      <Badge variant="secondary">Color Grading</Badge>
                      <Badge variant="secondary">VFX</Badge>
                    </div>
                    
                    <Button className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Me
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="showreel">Showreel</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="portfolio" className="animate-fade-in opacity-0">
                    <div className="mb-6">
                      <CategorySlider 
                        onSelectCategory={setSelectedCategory}
                        selectedCategoryId={selectedCategory?.id}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="showreel" className="animate-fade-in opacity-0">
                    <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
                      <div className="aspect-video relative">
                        <img 
                          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f" 
                          alt="Showreel thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer">
                            <Play className="h-10 w-10 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-medium mb-2">2023 Video Editing Showreel</h3>
                        <p className="text-muted-foreground">
                          A compilation of my best work from the past year, showcasing various styles and techniques.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="testimonials" className="animate-fade-in opacity-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array(4).fill(null).map((_, i) => (
                        <div key={i} className={cn(
                          "p-6 rounded-2xl border border-border bg-background shadow-sm",
                          i === 0 && "md:col-span-2"
                        )}>
                          <div className="flex items-center mb-4">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>
                                {['JD', 'AM', 'TS', 'RK'][i % 4]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">
                                {['John Doe', 'Alice Miller', 'Tom Smith', 'Rachel Kim'][i % 4]}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {['Marketing Director', 'Film Producer', 'Brand Manager', 'Creative Director'][i % 4]}
                              </p>
                            </div>
                          </div>
                          <p className="text-muted-foreground">
                            {[
                              "Working with this editor was a game-changer for our brand. The cinematic quality and storytelling brought our vision to life perfectly.",
                              "Extremely professional and creative. Delivered the project ahead of schedule with excellent quality.",
                              "The attention to detail and technical skills are outstanding. Will definitely hire again for future projects.",
                              "A true professional who understands both the technical and creative aspects of video editing."
                            ][i % 4]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Portfolio;
