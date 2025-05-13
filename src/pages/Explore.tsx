
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { Category } from '@/types';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';
import Footer from '@/components/Footer';
import ExploreHeader from '@/components/ExploreHeader';
import VideoGrid from '@/components/VideoGrid';
import EditorSearchDialog from '@/components/EditorSearchDialog';
import { useVideos, ExploreVideoType } from '@/hooks/useVideos';
import { useEditors } from '@/hooks/useEditors';
import { toast } from 'sonner';

const Explore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ExploreVideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // Use custom hooks
  const { videos, isLoading: isLoadingVideos } = useVideos(selectedCategory);
  const { editors, isLoading: isLoadingEditors } = useEditors();

  useEffect(() => {
    // Check if the videos loaded successfully
    if (videos.length > 0) {
      console.log('Videos loaded successfully:', videos.length);
    }
  }, [videos]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleVideoClick = (video: ExploreVideoType) => {
    console.log('Video clicked:', video);
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Toaster />
      <main className="flex-grow pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <ExploreHeader 
            onCategorySelect={handleCategorySelect}
            selectedCategoryId={selectedCategory?.id}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Fixed height container to prevent layout shifts */}
          <div className="w-full mb-10 min-h-[60vh]">
            <VideoGrid 
              videos={videos}
              isLoading={isLoadingVideos}
              onVideoClick={handleVideoClick}
              selectedCategory={selectedCategory?.name}
            />
          </div>
        </div>
      </main>
      <Footer />

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

      <EditorSearchDialog
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        editors={editors}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        isLoading={isLoadingEditors}
      />
    </div>
  );
};

export default Explore;
