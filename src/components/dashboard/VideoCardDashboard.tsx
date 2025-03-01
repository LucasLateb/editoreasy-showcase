
import React from 'react';
import { Video } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface VideoCardDashboardProps {
  video: Video;
  category: { name: string } | undefined;
  onDelete: (videoId: string) => void;
  onEdit?: (videoId: string) => void;
}

const VideoCardDashboard: React.FC<VideoCardDashboardProps> = ({
  video,
  category,
  onDelete,
  onEdit
}) => {
  return (
    <Card className="overflow-hidden hover-scale">
      <div className="relative aspect-video">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {category && (
          <div className="absolute bottom-3 left-3 rounded-full px-2 py-1 bg-primary/90 text-xs text-white">
            {category.name}
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {video.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-sm text-muted-foreground pb-0">
        <div className="flex space-x-4">
          <div>{video.views} views</div>
          <div>{video.likes} likes</div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        {onEdit && (
          <Button size="sm" variant="outline" onClick={() => onEdit(video.id)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => onDelete(video.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoCardDashboard;
