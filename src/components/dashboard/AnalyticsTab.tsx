import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ViewsChart from './analytics/ViewsChart';
import VideoAnalytics from './analytics/BrowserStats'; // Ce fichier exporte VideoAnalytics
import { Loader2, Users, Play, Globe, ThumbsUp, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card'; // CardContent n'est pas utilisé directement ici, mais gardons pour cohérence si jamais.
import { Video } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AnalyticsTab: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('7'); // default to 7 days

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
    queryKey: ['analytics', currentUser?.id, timePeriod, 'v2'], // Ajout de 'v2' pour refléter les changements
    queryFn: async () => {
      if (!currentUser?.id || !hasPremiumAccess) return null;

      const daysAgo = parseInt(timePeriod);
      const comparisonDate = new Date();
      comparisonDate.setDate(comparisonDate.getDate() - daysAgo);
      const comparisonDateString = comparisonDate.toISOString();
      
      const previousPeriodStart = new Date();
      previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
      const previousPeriodStartString = previousPeriodStart.toISOString();

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories') // Supposition: une table 'categories' existe avec 'id' et 'name'
        .select('id, name'); 
      
      if (categoriesError) {
        console.warn('AnalyticsTab: Error fetching categories, category names might not be displayed.', categoriesError);
        // Ne pas throw, pour que le reste des analytics puisse se charger
      }
      const categoryMap = new Map((categoriesData || []).map((cat: {id: string, name: string}) => [cat.id, cat.name]));


      // Fetch profile views data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('portfolio_views, likes')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      // Get previous period portfolio views count
      const { count: previousPortfolioViewsCount, error: prevPortfolioViewsError } = await supabase
        .from('portfolio_views')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_user_id', currentUser.id)
        .gte('viewed_at', previousPeriodStartString)
        .lt('viewed_at', comparisonDateString);

      if (prevPortfolioViewsError) throw prevPortfolioViewsError;

      // Get current period portfolio views count
      const { count: currentPortfolioViewsCount, error: currPortfolioViewsError } = await supabase
        .from('portfolio_views')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_user_id', currentUser.id)
        .gte('viewed_at', comparisonDateString);

      if (currPortfolioViewsError) throw currPortfolioViewsError;

      // Fetch portfolio views over time
      const { data: portfolioViewsData, error: portfolioViewsError } = await supabase
        .from('portfolio_views')
        .select('viewed_at, browser')
        .eq('portfolio_user_id', currentUser.id)
        .gte('viewed_at', comparisonDateString); // Filtrer par la période de temps sélectionnée

      if (portfolioViewsError) throw portfolioViewsError;
      
      // Fetch videos data with views and likes
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;
      
      // Get total video likes
      let totalVideoLikes = videosData.reduce((total, video) => total + (video.likes || 0), 0);

      // Get video IDs for queries
      const videoIds = videosData.map(video => video.id);

      // Get previous period video views count
      const { count: previousVideoViewsCount, error: prevVideoViewsError } = await supabase
        .from('video_views')
        .select('*', { count: 'exact', head: true })
        .in('video_id', videoIds)
        .gte('viewed_at', previousPeriodStartString)
        .lt('viewed_at', comparisonDateString);
        
      if (prevVideoViewsError) throw prevVideoViewsError;

      // Get current period video views count
      const { count: currentVideoViewsCount, error: currVideoViewsError } = await supabase
        .from('video_views')
        .select('*', { count: 'exact', head: true })
        .in('video_id', videoIds)
        .gte('viewed_at', comparisonDateString);
        
      if (currVideoViewsError) throw currVideoViewsError;

      // Calculate previous period likes
      const { count: previousLikesCount, error: prevLikesError } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .in('video_id', videoIds)
        .gte('created_at', previousPeriodStartString)
        .lt('created_at', comparisonDateString);

      if (prevLikesError) throw prevLikesError;

      // Get current period likes count
      const { count: currentLikesCount, error: currLikesError } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .in('video_id', videoIds)
        .gte('created_at', comparisonDateString);

      if (currLikesError) throw currLikesError;

      // Calculate percentage changes
      const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const videoViewsPercentChange = calculatePercentageChange(
        currentVideoViewsCount || 0, 
        previousVideoViewsCount || 0
      );
      
      const portfolioViewsPercentChange = calculatePercentageChange(
        currentPortfolioViewsCount || 0, 
        previousPortfolioViewsCount || 0
      );
      
      const likesPercentChange = calculatePercentageChange(
        currentLikesCount || 0, 
        previousLikesCount || 0
      );

      // Fetch video views data for chart
      const { data: viewsDataForChart, error: viewsErrorForChart } = await supabase
        .from('video_views')
        .select('video_id, viewed_at')
        .in('video_id', videoIds)
        .gte('viewed_at', comparisonDateString); // Filtrer par la période de temps sélectionnée

      if (viewsErrorForChart) throw viewsErrorForChart;


      const formattedVideos: Video[] = videosData.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        thumbnailUrl: video.thumbnail_url,
        videoUrl: video.video_url,
        categoryId: video.category_id,
        categoryName: categoryMap.get(video.category_id) || 'Non classé', // Utilisation de la map pour le nom de catégorie
        userId: video.user_id,
        likes: video.likes || 0,
        views: video.views || 0, // Ce 'views' est le total historique, pas celui de la période
        createdAt: new Date(video.created_at),
        isHighlighted: video.is_highlighted
      }));

      const formatDateForChart = (dateStr: string): string => {
        return new Date(dateStr).toISOString().split('T')[0]; // Format YYYY-MM-DD
      };
      
      // Process video views data for chart
      const viewsByDate = new Map<string, number>();
      (viewsDataForChart || []).forEach(view => {
        const date = formatDateForChart(view.viewed_at);
        viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1);
      });

      // Process portfolio views data for chart
      const portfolioViewsByDate = new Map<string, number>();
      (portfolioViewsData || []).forEach(view => { // portfolioViewsData déjà filtré par date
        const date = formatDateForChart(view.viewed_at);
        portfolioViewsByDate.set(date, (portfolioViewsByDate.get(date) || 0) + 1);
      });

      const viewsChartData = Array.from(viewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date)); // Tri par date YYYY-MM-DD

      const portfolioViewsChartData = Array.from(portfolioViewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => a.date.localeCompare(b.date)); // Tri par date YYYY-MM-DD

      return {
        totalLikes: totalVideoLikes, // Ceci est le total des likes sur les vidéos, pas la variation
        likesPercentChange,
        videoViews: {
          total: currentVideoViewsCount || 0, // Vues vidéo sur la période
          percentChange: videoViewsPercentChange,
          chartData: viewsChartData,
        },
        portfolioViews: {
          total: currentPortfolioViewsCount || 0, // Vues portfolio sur la période
          percentChange: portfolioViewsPercentChange,
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
        <AlertTitle>Fonctionnalité Premium</AlertTitle>
        <AlertDescription>
          Les statistiques sont disponibles uniquement avec les plans <span className="font-semibold">Premium</span> et <span className="font-semibold">Pro</span>.
        </AlertDescription>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => navigate('/pricing')}
        >
          Mettre à niveau
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
        <AlertTitle>Aucune donnée disponible</AlertTitle>
        <AlertDescription>
          Commencez à partager vos vidéos et votre portfolio pour voir les données analytiques.
        </AlertDescription>
      </Alert>
    );
  }

  const renderPercentageChange = (percentChange: number) => {
    const formattedPercentage = Math.abs(Math.round(percentChange * 10) / 10);
    
    if (percentChange > 0) {
      return (
        <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
          <TrendingUp className="h-4 w-4" />
          <span>+{formattedPercentage}%</span>
        </div>
      );
    } else if (percentChange < 0) {
      return (
        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
          <TrendingDown className="h-4 w-4" />
          <span>-{formattedPercentage}%</span>
        </div>
      );
    } else {
      return (
        <div className="text-gray-500 text-sm mt-1">
          <span>0%</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner la période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Play className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground text-sm mb-1">Vues des Vidéos</div>
              <div className="text-3xl font-bold">{analyticsData.videoViews.total}</div>
              {renderPercentageChange(analyticsData.videoViews.percentChange)}
            </div>
          </div>
        </Card>
        
        <Card className="bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground text-sm mb-1">Vues du Portfolio</div>
              <div className="text-3xl font-bold">{analyticsData.portfolioViews.total}</div>
              {renderPercentageChange(analyticsData.portfolioViews.percentChange)}
            </div>
          </div>
        </Card>

        <Card className="bg-background p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-muted-foreground text-sm mb-1">Likes Totaux (Vidéos)</div>
              <div className="text-3xl font-bold">{analyticsData.totalLikes}</div>
              {renderPercentageChange(analyticsData.likesPercentChange)}
            </div>
          </div>
        </Card>
      </div>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Statistiques Vidéos</h3>
          <ViewsChart data={analyticsData.videoViews.chartData} />
          <div className="mt-4">
            <VideoAnalytics videos={analyticsData.videos} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Statistiques Portfolio</h3>
          <ViewsChart data={analyticsData.portfolioViews.chartData} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
