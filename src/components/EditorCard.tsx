
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Star, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface EditorCardProps {
  editor: User;
  index: number;
  showreelUrl?: string;
}

const EditorCard: React.FC<EditorCardProps> = ({ editor, index, showreelUrl }) => {
  const animationDelay = `${0.1 + index * 0.1}s`;
  const [showreelOpen, setShowreelOpen] = useState(false);
  
  return (
    <>
      <div 
        className="relative group p-5 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in opacity-0 hover-scale"
        style={{ animationDelay }}
      >
        <div className="absolute -top-3 -right-1">
          <Badge variant={editor.subscriptionTier === 'pro' ? 'default' : 'outline'} className="shadow-sm">
            {editor.subscriptionTier === 'pro' ? 'PRO' : editor.subscriptionTier.charAt(0).toUpperCase() + editor.subscriptionTier.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12 border-2 border-background shadow">
            <AvatarImage src={editor.avatarUrl} alt={editor.name} />
            <AvatarFallback>{editor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-medium">{editor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {editor.subscriptionTier === 'pro' && (
                <span className="inline-flex items-center mr-1">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" fill="currentColor" />
                </span>
              )}
              Joined {editor.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {showreelUrl && (
          <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-black/5 cursor-pointer" onClick={() => setShowreelOpen(true)}>
            <div className="w-full h-full relative flex items-center justify-center">
              <img 
                src={`https://img.youtube.com/vi/${showreelUrl.split('/').pop()}/mqdefault.jpg`}
                alt={`${editor.name}'s showreel`}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                  <Play className="h-6 w-6 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {editor.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{editor.bio}</p>
        )}
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Heart className={cn(
            "h-4 w-4 mr-1",
            editor.likes > 400 ? "text-red-500" : "text-muted-foreground"
          )} fill={editor.likes > 400 ? "currentColor" : "none"} />
          <span>{editor.likes} likes</span>
        </div>
        
        <Link to={`/editor/${editor.id}`} className="absolute inset-0 z-10" aria-label={`View ${editor.name}'s profile`}></Link>
        
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary"></div>
        </div>
      </div>
      
      {showreelUrl && (
        <Dialog open={showreelOpen} onOpenChange={setShowreelOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background">
            <div className="aspect-video w-full">
              <iframe
                src={showreelUrl}
                title={`${editor.name}'s showreel`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EditorCard;
