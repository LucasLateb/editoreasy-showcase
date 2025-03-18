import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import EditorCard from '@/components/EditorCard';
import VideoCard from '@/components/VideoCard';
import PricingPlans from '@/components/PricingPlans';
import { Category, categories } from '@/types';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

// Mock videos for demonstration
const mockVideos = Array(6).fill(null).map((_, i) => ({
  id: `video-${i}`,
  title: `Amazing ${categories[i % categories.length].name} Project`,
  description: 'This is a sample video description.',
  thumbnailUrl: `https://images.unsplash.com/photo-${1550745165 + i * 10}-9bc0b252726f`,
  videoUrl: '#',
  categoryId: categories[i % categories.length].id,
  userId: null,
  likes: Math.floor(Math.random() * 100),
  views: Math.floor(Math.random() * 1000),
  createdAt: new Date()
}));

// Mock showreel URLs for popular editors
const editorShowreels = {
  '1': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '2': 'https://www.youtube.com/embed/jNQXAC9IVRw',
  '3': 'https://www.youtube.com/embed/8ybW48rKBME',
  '4': 'https://www.youtube.com/embed/j5a0jTc9S10',
  '5': 'https://www.youtube.com/embed/CD-E-LDc384',
  '6': 'https://www.youtube.com/embed/6B26asyGKDo',
  '7': 'https://www.youtube.com/embed/ZEcqHA7dbwM',
  '8': 'https://www.youtube.com/embed/7PCkvCPvDXk'
};

const Index: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [popularEditors, setPopularEditors] = useState<any[]>([]);
  const [showreelData, setShowreelData] = useState<{[key: string]: {url?: string, thumbnail?: string}}>({}); 
  const [isLoading, setIsLoading] = useState(true);
  
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
        
        setPopularEditors(editors);
        
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_settings')
          .select('user_id, showreel_url, showreel_thumbnail')
          .in('user_id', editors.map(editor => editor.id));
        
        if (portfolioError) {
          console.error('Error fetching portfolio settings:', portfolioError);
        } else if (portfolioData) {
          const showreelMap: {[key: string]: {url?: string, thumbnail?: string}} = {};
          portfolioData.forEach(item => {
            showreelMap[item.user_id] = {
              url: item.showreel_url || undefined,
              thumbnail: item.showreel_thumbnail || undefined
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
  
  const filteredVideos = selectedCategory 
    ? mockVideos.filter(video => video.categoryId === selectedCategory.id)
    : mockVideos;
  
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Popular Editors</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover talented video editors with impressive portfolios
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-t-lg overflow-hidden pt-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="p-5 rounded-2xl bg-background border border-border animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div className="ml-3">
                      <div className="h-4 w-24 bg-muted rounded"></div>
                      <div className="h-3 w-32 bg-muted rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-muted rounded"></div>
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
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
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
    </div>
  );
};

export default Index;
