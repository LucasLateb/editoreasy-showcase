
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Category } from '@/types';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import ExploreHeader from '@/components/explore/ExploreHeader';
import VideoGrid from '@/components/explore/VideoGrid';
import EditorSearch from '@/components/explore/EditorSearch';
import { useExploreData, ExploreVideoType } from '@/hooks/useExploreData';

const Explore: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Use refs instead of state for UI elements to prevent unnecessary rerenders
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  // Use our custom hook for data fetching
  const { 
    videos, 
    isLoadingVideos, 
    editors, 
    isLoadingEditors 
  } = useExploreData(selectedCategory);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  const handleVideoClick = (video: ExploreVideoType) => {
    if (!video) return;
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      setIsSearchOpen(false);
      setSelectedVideo(null);
      setIsVideoDialogOpen(false);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster />
      
      {/* Set fixed min-height to prevent layout shifts */}
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <ExploreHeader 
            onSelectCategory={handleCategorySelect} 
            selectedCategory={selectedCategory}
            onOpenSearch={() => setIsSearchOpen(true)}
            isAuthenticated={isAuthenticated}
          />

          {/* Content area with stable minimum height */}
          <div className="min-h-[60vh] mt-6">
            <VideoGrid 
              videos={videos || []}
              isLoading={isLoadingVideos}
              selectedCategory={selectedCategory}
              onClearCategory={handleClearCategory}
              onVideoClick={handleVideoClick}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Dialogs */}
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

      <EditorSearch 
        editors={editors}
        isLoading={isLoadingEditors}
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </div>
  );
};

export default Explore;
