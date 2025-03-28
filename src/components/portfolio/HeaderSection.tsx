
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, Eye, Edit } from 'lucide-react';
import { Video } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface HeaderSectionProps {
  featuredVideo: Video;
  currentUser: any; // Changed to accept either the logged-in user or the editor being viewed
  editMode: boolean;
  thumbnailOptions: Array<{ id: string; url: string }>;
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
  thumbnailOptions,
  updateVideoThumbnail,
  title,
  setTitle,
  description,
  setDescription
}) => {
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleSaveTitle = () => {
    setTitle(editedTitle);
    setDescription(editedDescription);
    setTitleDialogOpen(false);
  };

  // Display title based on the current user (could be the editor we're viewing)
  const displayTitle = currentUser?.name ? `${currentUser.name}'s Portfolio` : title;

  return (
    <section className="relative h-[60vh] md:h-[70vh] overflow-hidden group">
      <div className="absolute inset-0">
        <img 
          src={featuredVideo.thumbnailUrl} 
          alt="Featured work" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      </div>
      
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.2s' }}>
              {editMode ? title : displayTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-in-down opacity-0" style={{ animationDelay: '0.4s' }}>
              {description}
            </p>
            
            <div className="flex flex-wrap gap-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.6s' }}>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                <Play className="h-4 w-4" />
                <span>Featured Work</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                <Heart className="h-4 w-4" />
                <span>{featuredVideo.likes} Likes</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition duration-200">
                <Eye className="h-4 w-4" />
                <span>{featuredVideo.views} Views</span>
              </button>
            </div>
            
            {editMode && (
              <div className="mt-8 flex gap-3 animate-slide-in-down opacity-0" style={{ animationDelay: '0.8s' }}>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                      Change Thumbnail
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Choose a thumbnail</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {thumbnailOptions.map(thumbnail => (
                        <Card 
                          key={thumbnail.id} 
                          className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                          onClick={() => updateVideoThumbnail(featuredVideo.id, thumbnail.url)}
                        >
                          <CardContent className="p-2">
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
                  </DialogContent>
                </Dialog>
                
                <Dialog open={titleDialogOpen} onOpenChange={setTitleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                      Edit Title & Description
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Portfolio Header</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label htmlFor="portfolio-title" className="text-sm font-medium">
                          Portfolio Title
                        </label>
                        <Input
                          id="portfolio-title"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          placeholder="Enter your portfolio title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="portfolio-description" className="text-sm font-medium">
                          Portfolio Description
                        </label>
                        <Textarea
                          id="portfolio-description"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          placeholder="Enter your portfolio description"
                          className="min-h-[100px]"
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
