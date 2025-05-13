
import React, { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);
  
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

  // Debug log to track editors data
  useEffect(() => {
    console.log('Explore page - editors:', editors?.length || 0);
    console.log('Explore page - isLoadingEditors:', isLoadingEditors);
  }, [editors, isLoadingEditors]);

  const handleCategorySelect = (category: Category) => {
    if (isMounted.current) {
      setSelectedCategory(category);
    }
  };

  const handleClearCategory = () => {
    if (isMounted.current) {
      setSelectedCategory(null);
    }
  };

  const handleVideoClick = (video: ExploreVideoType) => {
    if (!video || !isMounted.current) return;
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  // Improved cleanup effect
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
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
            onOpenSearch={() => isMounted.current && setIsSearchOpen(true)}
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

      {/* Dialogs - Only render when needed */}
      {selectedVideo && isVideoDialogOpen && (
        <VideoPlayerDialog
          isOpen={isVideoDialogOpen}
          onClose={() => isMounted.current && setIsVideoDialogOpen(false)}
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.title}
          videoId={selectedVideo.id}
          description={selectedVideo.description}
          editorId={selectedVideo.userId}
          editorName={selectedVideo.editorName}
          editorAvatar={selectedVideo.editorAvatar}
        />
      )}

      {isSearchOpen && (
        <EditorSearch 
          editors={editors || []}
          isLoading={isLoadingEditors}
          isOpen={isSearchOpen}
          onOpenChange={(open) => isMounted.current && setIsSearchOpen(open)}
        />
      )}
    </div>
  );
};

export default Explore;
