import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import VideoCard from '@/components/VideoCard';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, Star, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Video as VideoType, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import { useCategoriesWithFallback } from '@/hooks/useCategoriesWithFallback';
import { getVideoAspectRatio } from '@/utils/videoHelpers';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [allVideos, setAllVideos] = useState<VideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Use the hook with all videos for categories
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
        
        setAllVideos(formattedVideos);
        setVideos(formattedVideos);
        
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

  useEffect(() => {
    if (selectedCategory) {
      const filteredVideos = allVideos.filter(video => video.categoryId === selectedCategory.id);
      setVideos(filteredVideos);
    } else {
      setVideos(allVideos);
    }
  }, [selectedCategory, allVideos]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleVideoClick = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Toaster />
      
      <Hero />
      
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover videos across different editing styles and techniques
            </p>
          </div>
          
          <div className="mb-8">
            <CategorySlider 
              onSelectCategory={handleCategorySelect}
              selectedCategoryId={selectedCategory?.id}
              categories={availableCategories}
            />
          </div>
          
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
            (() => {
              // Group videos by aspect ratio for the new 3-column layout
              const verticalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'vertical');
              const horizontalVideos = videos.filter(video => getVideoAspectRatio(video.videoUrl) === 'horizontal');
              
              // Create rows with 2 horizontal + 1 vertical videos
              const rows = [];
              let horizontalIndex = 0;
              let verticalIndex = 0;
              
              while (horizontalIndex < horizontalVideos.length || verticalIndex < verticalVideos.length) {
                const row = {
                  horizontal: horizontalVideos.slice(horizontalIndex, horizontalIndex + 4), // 4 horizontal videos (2 rows of 2)
                  vertical: verticalVideos[verticalIndex] || null
                };
                
                rows.push(row);
                horizontalIndex += 4;
                verticalIndex += 1;
              }
              
              return (
                <div className="space-y-6">
                  {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-3 gap-4 h-[400px]">
                      {/* Left column: 2x2 grid of horizontal videos */}
                      <div className="col-span-2">
                        <div className="grid grid-cols-2 gap-4 h-full">
                          {row.horizontal.map((video, index) => (
                            <div key={video.id} onClick={() => handleVideoClick(video)} className="cursor-pointer">
                              <VideoCard video={video} />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Right column: 1 vertical video spanning full height */}
                      <div className="col-span-1">
                        {row.vertical && (
                          <div onClick={() => handleVideoClick(row.vertical)} className="cursor-pointer h-full">
                            <VideoCard video={row.vertical} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Perfect Video Editor</h2>
            <p className="text-muted-foreground text-lg">
              Search through our database of talented video editors
            </p>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex max-w-md mx-auto gap-2">
            <Input
              type="text"
              placeholder="Search editors by name, style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardContent className="p-6">
                <VideoIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
                <p className="text-muted-foreground">
                  Access high-quality video editing services from verified professionals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Growing Community</h3>
                <p className="text-muted-foreground">
                  Join our expanding network of creators and video editing professionals
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <Star className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Top Rated</h3>
                <p className="text-muted-foreground">
                  Browse through top-rated editors and their best work
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
    </div>
  );
};

export default Index;
