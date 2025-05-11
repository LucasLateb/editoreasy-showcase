
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ViewsChart from './analytics/ViewsChart';
import VideoAnalytics from './analytics/BrowserStats';
import { Loader2, Users, Play, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Video } from '@/types';

const AnalyticsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { data: hasPremiumAccess, isLoading: checkingAccess } = useQuery({
    queryKey: ['premiumAccess', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return false;
      const { data, error } = await supabase
        .rpc('has_premium_access', { user_id_param: currentUser.id });
      if (error) throw error;
      return data;
    },
  });

  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['analytics', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id || !hasPremiumAccess) return null;

      // Fetch profile views data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('portfolio_views')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      // Fetch portfolio views over time
      const { data: portfolioViewsData, error: portfolioViewsError } = await supabase
        .from('portfolio_views')
        .select('viewed_at, browser')
        .eq('portfolio_user_id', currentUser.id);

      if (portfolioViewsError) throw portfolioViewsError;

      // Fetch videos data with views and likes
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch video views data
      const { data: viewsData, error: viewsError } = await supabase
        .from('video_views')
        .select('video_id, viewed_at')
        .in('video_id', 
          videosData.map(video => video.id)
        );

      if (viewsError) throw viewsError;

      // Transformons les vidéos pour inclure la catégorie et formater les dates
      const formattedVideos: Video[] = videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        thumbnailUrl: video.thumbnail_url,
        videoUrl: video.video_url,
        categoryId: video.category_id,
        categoryName: video.category_id, // Nous allons utiliser l'ID comme nom par simplicité
        userId: video.user_id,
        likes: video.likes || 0,
        views: video.views || 0,
        createdAt: new Date(video.created_at),
        isHighlighted: video.is_highlighted
      }));

      // Process video views data
      const viewsByDate = new Map();
      let totalVideoViews = 0;

      viewsData?.forEach(view => {
        const date = new Date(view.viewed_at).toLocaleDateString();
        viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1);
        totalVideoViews++;
      });

      // Process portfolio views data
      const portfolioViewsByDate = new Map();
      let totalPortfolioViews = profileData?.portfolio_views || 0;

      portfolioViewsData?.forEach(view => {
        const date = new Date(view.viewed_at).toLocaleDateString();
        portfolioViewsByDate.set(date, (portfolioViewsByDate.get(date) || 0) + 1);
      });

      // Format data for charts
      const viewsChartData = Array.from(viewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const portfolioViewsChartData = Array.from(portfolioViewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        videoViews: {
          total: totalVideoViews,
          chartData: viewsChartData,
        },
        portfolioViews: {
          total: totalPortfolioViews,
          chartData: portfolioViewsChartData,
        },
        videos: formattedVideos
      };
    },
    enabled: hasPremiumAccess === true,
  });

  if (checkingAccess) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasPremiumAccess) {
    return (
      <Alert variant="default" className="mb-4">
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          Analytics are available only on <span className="font-semibold">Premium</span> and <span className="font-semibold">Pro</span> plans.
        </AlertDescription>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => navigate('/pricing')}
        >
          Upgrade Plan
        </Button>
      </Alert>
    );
  }

  if (loadingAnalytics) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          Start sharing your videos and portfolio to see analytics data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Play className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground text-sm mb-1">Video Views</div>
              <div className="text-3xl font-bold">{analyticsData.videoViews.total}</div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground text-sm mb-1">Portfolio Views</div>
              <div className="text-3xl font-bold">{analyticsData.portfolioViews.total}</div>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Video Analytics</h3>
          <ViewsChart data={analyticsData.videoViews.chartData} />
          <div className="mt-4">
            <VideoAnalytics videos={analyticsData.videos} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Portfolio Analytics</h3>
          <ViewsChart data={analyticsData.portfolioViews.chartData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
