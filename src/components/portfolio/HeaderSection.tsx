
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video } from '@/types';

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
                        <Label htmlFor="thumbnail">Upload Image max 1mo</Label>
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

                
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
