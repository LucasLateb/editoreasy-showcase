
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Play, Edit, Link } from 'lucide-react';

interface ShowreelSectionProps {
  showreelUrl: string;
  showreelThumbnail: string;
  editMode: boolean;
  showreelDialogOpen: boolean;
  setShowreelDialogOpen: (open: boolean) => void;
  setShowreelUrl: (url: string) => void;
  updateShowreel: (url: string) => void;
  updateShowreelThumbnail: (url: string) => void;
  thumbnailOptions: Array<{ id: string; url: string }>;
}

const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreelUrl,
  showreelThumbnail,
  editMode,
  showreelDialogOpen,
  setShowreelDialogOpen,
  setShowreelUrl,
  updateShowreel,
  updateShowreelThumbnail,
  thumbnailOptions
}) => {
  // If there's no showreel URL and we're not in edit mode, don't render anything
  if (!showreelUrl && !editMode) {
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
    // Ensure the URL is properly formatted
    try {
      // Check if it's a valid URL
      new URL(showreelUrl);
      iframeSrc = showreelUrl;
    } catch (e) {
      // If not a valid URL, fallback to treating it as is
      console.error('Invalid URL format:', e);
      iframeSrc = showreelUrl; // Use as is, the browser will handle it
    }
  }

  // Validate the URL to prevent malformed URIs
  const isValidUrl = () => {
    try {
      if (iframeSrc) {
        // This will throw if the URL is malformed
        decodeURI(iframeSrc);
        return true;
      }
      return false;
    } catch (e) {
      console.error("URI malformed error:", e);
      return false;
    }
  };

  return (
    <div className="mb-8 mt-2 bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h3 className="text-lg font-medium">My Showreel</h3>
        {editMode && (
          <Dialog open={showreelDialogOpen} onOpenChange={setShowreelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Showreel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Showreel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label htmlFor="showreel-url" className="text-sm font-medium mb-2 block">
                    Showreel URL (YouTube, Vimeo, etc.)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="showreel-url"
                      value={showreelUrl || ''}
                      onChange={(e) => setShowreelUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/your-video-id"
                      className="flex-1"
                    />
                    <Button onClick={() => updateShowreel(showreelUrl || '')}>
                      <Link className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an embed URL from YouTube or Vimeo for best results
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Showreel Thumbnail</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {thumbnailOptions.map(thumbnail => (
                      <Card 
                        key={thumbnail.id} 
                        className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                        onClick={() => updateShowreelThumbnail(thumbnail.url)}
                      >
                        <CardContent className="p-1">
                          <div className="aspect-video relative overflow-hidden rounded">
                            <img 
                              src={thumbnail.url} 
                              alt={`Thumbnail option ${thumbnail.id}`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="aspect-video relative">
        {showreelUrl ? (
          isEmbedCode ? (
            <div 
              className="w-full h-full" 
              dangerouslySetInnerHTML={{ __html: showreelUrl }}
            />
          ) : isValidUrl() ? (
            <iframe 
              src={iframeSrc}
              title="Showreel" 
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <p className="text-muted-foreground">Invalid showreel URL</p>
            </div>
          )
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={showreelThumbnail} 
              alt="Showreel thumbnail" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm hover:bg-primary transition-colors cursor-pointer">
                <Play className="h-10 w-10 text-white" fill="white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowreelSection;
