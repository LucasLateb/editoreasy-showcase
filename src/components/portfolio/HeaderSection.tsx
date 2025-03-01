
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Heart, Eye, Edit } from 'lucide-react';
import { Video } from '@/types';

interface HeaderSectionProps {
  featuredVideo: Video;
  currentUser: any;
  editMode: boolean;
  thumbnailOptions: Array<{ id: string; url: string }>;
  updateVideoThumbnail: (videoId: string, newThumbnailUrl: string) => void;
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ 
  featuredVideo, 
  currentUser, 
  editMode, 
  thumbnailOptions,
  updateVideoThumbnail
}) => {
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
      
      {editMode && (
        <div className="absolute top-4 right-4 z-10 space-x-2">
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
        </div>
      )}
      
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in-down opacity-0" style={{ animationDelay: '0.2s' }}>
              {currentUser?.name || 'Video Editor'} Portfolio
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-in-down opacity-0" style={{ animationDelay: '0.4s' }}>
              {currentUser?.bio || 'Professional video editor specializing in cinematic visuals, motion graphics, and compelling storytelling.'}
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderSection;
