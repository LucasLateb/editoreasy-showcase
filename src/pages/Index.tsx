
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import EditorCard from '@/components/EditorCard';
import VideoCard from '@/components/VideoCard';
import PricingPlans from '@/components/PricingPlans';
import { Category, categories, popularEditors } from '@/types';

// Mock videos for demonstration
const mockVideos = Array(6).fill(null).map((_, i) => ({
  id: `video-${i}`,
  title: `Amazing ${categories[i % categories.length].name} Project`,
  description: 'This is a sample video description.',
  thumbnailUrl: `https://images.unsplash.com/photo-${1550745165 + i * 10}-9bc0b252726f`,
  videoUrl: '#',
  categoryId: categories[i % categories.length].id,
  userId: popularEditors[i % popularEditors.length].id,
  likes: Math.floor(Math.random() * 100),
  views: Math.floor(Math.random() * 1000),
  createdAt: new Date()
}));

// Mock showreel URLs for popular editors
const editorShowreels = {
  '1': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '2': 'https://www.youtube.com/embed/jNQXAC9IVRw',
  '3': 'https://www.youtube.com/embed/8ybW48rKBME',
  '4': 'https://www.youtube.com/embed/j5a0jTc9S10'
};

const Index: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularEditors.map((editor, index) => (
              <EditorCard 
                key={editor.id} 
                editor={editor} 
                index={index}
                showreelUrl={editorShowreels[editor.id as keyof typeof editorShowreels]}
              />
            ))}
          </div>
        </section>
        
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
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
