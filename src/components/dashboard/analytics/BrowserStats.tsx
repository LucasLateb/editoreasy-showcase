
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Video } from '@/types';
import { Heart, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VideoAnalyticsProps {
  videos: Video[];
}

const VideoAnalytics: React.FC<VideoAnalyticsProps> = ({ videos }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('VideoAnalytics.Title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('VideoAnalytics.TitleColumn')}</TableHead>
              <TableHead>{t('VideoAnalytics.CategoryColumn')}</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <Eye size={16} className="mr-1" />
                  {t('VideoAnalytics.ViewsColumn')}
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  <Heart size={16} className="mr-1" fill="currentColor" />
                  {t('VideoAnalytics.LikesColumn')}
                </div>
              </TableHead>
              <TableHead className="text-right">{t('VideoAnalytics.CreatedColumn')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {t('VideoAnalytics.NoVideos')}
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium truncate max-w-[200px]">{video.title}</TableCell>
                  <TableCell>{video.categoryName || t('VideoAnalytics.Uncategorized')}</TableCell> 
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
