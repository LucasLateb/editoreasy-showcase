
import React, { useState } from 'react';
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
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  // Use our custom hook to fetch data
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
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <ExploreHeader 
            onSelectCategory={handleCategorySelect} 
            selectedCategory={selectedCategory}
            onOpenSearch={() => setIsSearchOpen(true)}
            isAuthenticated={isAuthenticated}
          />

          {/* Content area with minimum height to prevent layout shifts */}
          <div className="min-h-[60vh]">
            <VideoGrid 
              videos={videos}
              isLoading={isLoadingVideos}
              selectedCategory={selectedCategory}
              onClearCategory={handleClearCategory}
              onVideoClick={handleVideoClick}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Video player dialog */}
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

      {/* Editor search dialog */}
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
