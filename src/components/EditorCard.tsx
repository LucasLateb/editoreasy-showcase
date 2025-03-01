
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EditorCardProps {
  editor: User;
  index: number;
}

const EditorCard: React.FC<EditorCardProps> = ({ editor, index }) => {
  const animationDelay = `${0.1 + index * 0.1}s`;
  
  return (
    <Link to={`/editor/${editor.id}`} className="outline-none">
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
        
        <div className="absolute bottom-0 left-0 w-full h-1 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-r from-primary/80 to-primary"></div>
        </div>
      </div>
    </Link>
  );
};

export default EditorCard;
