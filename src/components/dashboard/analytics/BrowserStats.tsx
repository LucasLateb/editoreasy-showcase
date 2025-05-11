
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Video } from '@/types';
import { Heart, Eye } from 'lucide-react';

interface VideoAnalyticsProps {
  videos: Video[];
}

const VideoAnalytics: React.FC<VideoAnalyticsProps> = ({ videos }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vidéos Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <Eye size={16} className="mr-1" />
                  Vues
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <Heart size={16} className="mr-1" fill="currentColor" />
                  Likes
                </div>
              </TableHead>
              <TableHead className="text-right">Créée le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucune vidéo trouvée
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">{video.title}</TableCell>
                  <TableCell>{video.categoryName || 'Non classé'}</TableCell>
                  <TableCell className="text-right">{video.views}</TableCell>
                  <TableCell className="text-right">{video.likes}</TableCell>
                  <TableCell className="text-right">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default VideoAnalytics;
