import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileVideo2 } from 'lucide-react';
import { Video } from '@/types';
import { Label } from '@/components/ui/label';

interface HeaderSectionProps {
  featuredVideo: Video;
  currentUser: any;
  editMode: boolean;
  updateVideoThumbnail: (videoId: string, newThumbnailUrl: string) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  totalVideos?: number;
  isSavingTitle?: boolean;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  featuredVideo,
  currentUser,
  editMode,
  updateVideoThumbnail,
  title,
  setTitle,
  totalVideos = 0,
  isSavingTitle = false,
}) => {
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);

  React.useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleSaveTitle = () => {
    setTitle(editedTitle.trim());
    setTitleDialogOpen(false);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateVideoThumbnail(featuredVideo.id, base64String);
        setThumbnailDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayTitle = currentUser?.name
    ? `${currentUser.name}'s Portfolio`
    : title;

  return (
    <section className="relative h-[40vh] md:h-[50vh] overflow-hidden group">
      <div className="absolute inset-0">
        <img
          src={featuredVideo.thumbnailUrl}
          alt="Featured work"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/60 to-transparent"></div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end pb-8">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl -mt-20">
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-2 animate-slide-in-down opacity-0 bg-black/40 inline-block px-3 py-1 rounded"
              style={{ animationDelay: '0.2s' }}
            >
              {editMode ? title : displayTitle}
            </h1>
            
            <div
              className="
                animate-slide-in-down 
                opacity-0 
                flex
                items-center
                gap-2 
                text-white 
                bg-black/40
                px-2
                py-1
                rounded 
                shadow-lg 
                shadow-black/40
                whitespace-nowrap
                w-fit
              "
              style={{ animationDelay: '0.4s' }}
            >
              <FileVideo2 className="h-4 w-4" />
              <span className="text-sm">
                {totalVideos} Video{totalVideos !== 1 ? 's' : ''} Available
              </span>
            </div>

            {editMode && (
              <div
                className="mt-4 flex gap-3 animate-slide-in-down opacity-0"
                style={{ animationDelay: '0.8s' }}
              >
                <Dialog open={thumbnailDialogOpen} onOpenChange={setThumbnailDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      Change Thumbnail
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Choose a new thumbnail</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="thumbnail">Upload Image</Label>
                        <Input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="cursor-pointer"
                        />
                      </div>

                      {featuredVideo.thumbnailUrl && (
                        <div className="space-y-2">
                          <Label>Current Thumbnail</Label>
                          <div className="aspect-video relative rounded-lg overflow-hidden border">
                            <img
                              src={featuredVideo.thumbnailUrl}
                              alt="Current thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={titleDialogOpen} onOpenChange={setTitleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-background/80 backdrop-blur-sm"
                    >
                      Edit Title
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Portfolio Header</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="portfolio-title"
                          className="text-sm font-medium"
                        >
                          Portfolio Title
                        </label>
                        <Input
                          id="portfolio-title"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          placeholder="Enter your portfolio title"
                          disabled={isSavingTitle}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setTitleDialogOpen(false)}
                          disabled={isSavingTitle}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveTitle}
                          disabled={isSavingTitle || editedTitle.trim() === ''}
                        >
                          {isSavingTitle ? (
                            <>
                              <span className="mr-2">Saving...</span>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
