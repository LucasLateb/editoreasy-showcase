
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Eye } from 'lucide-react';
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
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  featuredVideo,
  currentUser,
  editMode,
  updateVideoThumbnail,
  title,
  setTitle,
}) => {
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);

  const handleSaveTitle = () => {
    setTitle(editedTitle);
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

  const displayTitle = currentUser?.name ? `${currentUser.name}'s Portfolio` : title;

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

      <div className="absolute inset-0 flex items-end pb-8">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-2">
            <h1
              className="text-4xl md:text-5xl font-bold text-white mb-2 animate-slide-in-up opacity-0 bg-black/40 inline-block px-3 py-1 rounded"
              style={{ animationDelay: '0.2s' }}
            >
              {editMode ? title : displayTitle}
            </h1>
            <div 
              className="flex flex-col items-start gap-2 animate-slide-in-up opacity-0 bg-black/40 inline-flex px-3 py-1 rounded"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-1 text-white">
                <Heart className="w-4 h-4" />
                <span>{featuredVideo.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <Eye className="w-4 h-4" />
                <span>{featuredVideo.views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="absolute top-4 right-4 flex gap-3 animate-slide-in-down opacity-0" style={{ animationDelay: '0.8s' }}>
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
                <DialogTitle>Edit Portfolio Title</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolio-title">Portfolio Title</Label>
                  <Input
                    id="portfolio-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Enter your portfolio title"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveTitle}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </section>
  );
};

export default HeaderSection;
