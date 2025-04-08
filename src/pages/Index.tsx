
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import EditorCard from '@/components/EditorCard';
import VideoCard from '@/components/VideoCard';
import PricingPlans from '@/components/PricingPlans';
import { Toaster } from '@/components/Toaster';
import { Category, categories } from '@/types';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink 
} from '@/components/ui/pagination';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';

const Index: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [popularEditors, setPopularEditors] = useState<any[]>([]);
  const [showreelData, setShowreelData] = useState<{[key: string]: {
    url?: string, 
    thumbnail?: string, 
    about?: string,
    specializations?: string[]
  }}>({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };
  
  useEffect(() => {
    const fetchPopularEditors = async () => {
      try {
        const { data: editorsData, error: editorsError } = await supabase
          .from('profiles')
          .select('*')
          .order('likes', { ascending: false })
          .limit(8);
        
        if (editorsError) {
          console.error('Error fetching popular editors:', editorsError);
          return;
        }
        
        const editors = editorsData.map(editor => ({
          ...editor,
          createdAt: new Date(editor.created_at),
          subscriptionTier: editor.subscription_tier || 'free',
          avatarUrl: editor.avatar_url,
        }));
        
        // Sort editors by subscription tier (pro > premium > free)
        const sortedEditors = editors.sort((a, b) => {
          const tierOrder = { pro: 1, premium: 2, free: 3 };
          const aTierValue = tierOrder[a.subscriptionTier as keyof typeof tierOrder] || 3;
          const bTierValue = tierOrder[b.subscriptionTier as keyof typeof tierOrder] || 3;
          
          // First by tier
          if (aTierValue !== bTierValue) {
            return aTierValue - bTierValue;
          }
          
          // Then by likes (within the same tier)
          return b.likes - a.likes;
        });
        
        setPopularEditors(sortedEditors);
        
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_settings')
          .select('user_id, showreel_url, showreel_thumbnail, about, specializations')
          .in('user_id', editors.map(editor => editor.id));
        
        if (portfolioError) {
          console.error('Error fetching portfolio settings:', portfolioError);
        } else if (portfolioData) {
          const showreelMap: {[key: string]: {
            url?: string, 
            thumbnail?: string, 
            about?: string,
            specializations?: string[]
          }} = {};
          
          portfolioData.forEach(item => {
            // Parse specializations from the JSON array in the database
            let specializationsArray: string[] = [];
            if (item.specializations) {
              try {
                // Make sure we handle both string JSON and already parsed objects
                if (typeof item.specializations === 'string') {
                  specializationsArray = JSON.parse(item.specializations);
                } else if (Array.isArray(item.specializations)) {
                  specializationsArray = item.specializations;
                }
              } catch (e) {
                console.error('Error parsing specializations:', e);
              }
            }
            
            showreelMap[item.user_id] = {
              url: item.showreel_url || undefined,
              thumbnail: item.showreel_thumbnail || undefined,
              about: item.about || undefined,
              specializations: specializationsArray
            };
          });
          setShowreelData(showreelMap);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularEditors();
  }, []);
  
  useEffect(() => {
    const fetchVideos = async () => {
      setIsVideosLoading(true);
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }
        
        const profileMap = new Map();
        profiles.forEach((profile) => {
          profileMap.set(profile.id, {
            tier: profile.subscription_tier || 'free',
            name: profile.name || 'Unknown Editor',
            avatar: profile.avatar_url
          });
        });
        
        let query = supabase
          .from('videos')
          .select('*');
          
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory.id);
        }
        
        const { data: videosData, error: videosError } = await query;
        
        if (videosError) {
          console.error('Error fetching videos:', videosError);
          return;
        }
        
        if (videosData) {
          const processedVideos = videosData.map(video => {
            const profileInfo = profileMap.get(video.user_id) || { 
              tier: 'free', 
              name: 'Unknown Editor',
              avatar: null
            };
            
            return {
              id: video.id,
              title: video.title,
              description: video.description || '',
              thumbnailUrl: video.thumbnail_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
              videoUrl: video.video_url || '#',
              categoryId: video.category_id,
              userId: video.user_id,
              editorName: profileInfo.name,
              editorAvatar: profileInfo.avatar,
              editorTier: profileInfo.tier,
              likes: video.likes || 0,
              views: video.views || 0,
              createdAt: new Date(video.created_at),
              isHighlighted: video.is_highlighted || false
            };
          });
          
          const sortedVideos = processedVideos.sort((a, b) => {
            if (a.editorTier === 'pro' && b.editorTier !== 'pro') return -1;
            if (a.editorTier !== 'pro' && b.editorTier === 'pro') return 1;
            if (a.isHighlighted && !b.isHighlighted) return -1;
            if (!a.isHighlighted && b.isHighlighted) return 1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          }).slice(0, 30);
          
          setVideos(sortedVideos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsVideosLoading(false);
      }
    };
    
    fetchVideos();
  }, [selectedCategory]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <Toaster />
      
      <main>
        <Hero />
        
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Popular Editors</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover talented video editors with impressive portfolios
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 rounded-t-lg overflow-hidden pt-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="p-5 rounded-2xl bg-background border border-border animate-pulse min-h-[350px]">
                  <div className="flex items-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted"></div>
                    <div className="ml-3">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-32 bg-muted rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted rounded mb-3"></div>
                  <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                  <div className="h-[120px] w-full bg-muted rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 w-16 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 bg-muted rounded"></div>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              popularEditors.map((editor, index) => {
                const showreelInfo = showreelData[editor.id] || {};
                return (
                  <EditorCard 
                    key={editor.id} 
                    editor={editor} 
                    index={index}
                    showreelUrl={showreelInfo.url}
                    showreelThumbnail={showreelInfo.thumbnail}
                    about={showreelInfo.about}
                    specializations={showreelInfo.specializations}
                  />
                );
              })
            )}
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Separator className="my-8 border-dashed border-border/60" />
        </div>
        
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Browse Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore different styles of video editing to find the perfect editor for your project
            </p>
          </div>
          
          <CategorySlider 
            onSelectCategory={setSelectedCategory}
            selectedCategoryId={selectedCategory?.id}
          />
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 rounded-b-lg overflow-hidden pb-4">
            {isVideosLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg animate-pulse" />
              ))
            ) : videos.length > 0 ? (
              videos.map((video) => (
                <div key={video.id} onClick={() => handleVideoClick(video)}>
                  <VideoCard key={video.id} video={video} />
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center">
                <h3 className="text-lg font-medium mb-2">No videos found in this category</h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later
                </p>
              </div>
            )}
          </div>
          
          {videos.length > 0 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>1</PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
        
        <PricingPlans />
        
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Showcase Your Video Editing Skills?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of video editors who are using VideoCut to showcase their work, 
              attract clients, and grow their business.
            </p>
            <div className="inline-block rounded-full bg-primary/10 p-1 backdrop-blur-sm animate-pulse-subtle">
              <button className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Get Started Today
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-secondary py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">VideoCut</h3>
              <p className="text-sm text-muted-foreground">
                The portfolio platform for video editors.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>© 2023 VideoCut. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-foreground">Terms</a>
                <a href="#" className="hover:text-foreground">Privacy</a>
                <a href="#" className="hover:text-foreground">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {selectedVideo && (
        <VideoPlayerDialog
          isOpen={isVideoDialogOpen}
          onClose={() => setIsVideoDialogOpen(false)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
};

export default Index;
