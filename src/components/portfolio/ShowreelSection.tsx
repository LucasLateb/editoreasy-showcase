
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import VideoPlayerDialog from '@/components/VideoPlayerDialog';

interface ShowreelSectionProps {
  showreelUrl: string;
  showreelThumbnail: string;
  editMode: boolean;
}

const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreelUrl,
  showreelThumbnail,
  editMode
}) => {
  // Use state to control the video player dialog
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  
  // If there's no showreel URL and we're not in edit mode, don't render anything
  if (!showreelUrl) {
    return null;
  }

  // Check if the URL is actually an embed code (contains iframe)
  const isEmbedCode = showreelUrl && typeof showreelUrl === 'string' && showreelUrl.includes('<iframe');
  
  // Extract the src URL from an embed code if needed
  const extractSrcFromEmbed = (embedCode: string) => {
    try {
      const srcMatch = embedCode.match(/src="([^"]+)"/);
      return srcMatch && srcMatch[1] ? srcMatch[1] : '';
    } catch (error) {
      console.error('Error extracting src from embed code:', error);
      return '';
    }
  };
  
  // Get the actual URL to use in the iframe
  let iframeSrc = '';
  if (isEmbedCode && showreelUrl) {
    iframeSrc = extractSrcFromEmbed(showreelUrl);
  } else if (showreelUrl) {
    // Just use the URL as is
    iframeSrc = showreelUrl;
  }

  const handlePlayClick = () => {
    setVideoPlayerOpen(true);
  };

  // Log to debug thumbnail source
  console.log('Showreel thumbnail:', showreelThumbnail);

  return (
    <div className="mb-8 mt-2 bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium">My Showreel</h3>
      </div>
      <div className="aspect-video relative">
        <div className="relative w-full h-full">
          <img 
            src={showreelThumbnail} 
            alt="Showreel thumbnail" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load thumbnail:', showreelThumbnail);
              e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f';
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer"
              onClick={handlePlayClick}
            >
              <Play className="h-10 w-10 text-white" fill="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Dialog */}
      <VideoPlayerDialog
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        videoUrl={showreelUrl}
        title="My Showreel"
      />
    </div>
  );
};

export default ShowreelSection;
