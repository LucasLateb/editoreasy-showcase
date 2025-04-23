
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ViewsChart from './analytics/ViewsChart';
import BrowserStats from './analytics/BrowserStats';
import { Loader2, Users, Play, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

      // Fetch video views data
      const { data: viewsData, error: viewsError } = await supabase
        .from('video_views')
        .select('video_id, viewed_at, browser')
        .in('video_id', 
          await supabase
            .from('videos')
            .select('id')
            .eq('user_id', currentUser.id)
            .then(({ data }) => data ? data.map(item => item.id) : [])
        );

      if (viewsError) throw viewsError;

      // Process video views data
      const viewsByDate = new Map();
      const browserCounts = new Map();
      let totalVideoViews = 0;

      viewsData?.forEach(view => {
        const date = new Date(view.viewed_at).toLocaleDateString();
        viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1);
        
        const browser = view.browser || 'Unknown';
        browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
        totalVideoViews++;
      });

      // Process portfolio views data
      const portfolioViewsByDate = new Map();
      const portfolioBrowserCounts = new Map();
      let totalPortfolioViews = profileData?.portfolio_views || 0;

      portfolioViewsData?.forEach(view => {
        const date = new Date(view.viewed_at).toLocaleDateString();
        portfolioViewsByDate.set(date, (portfolioViewsByDate.get(date) || 0) + 1);
        
        const browser = view.browser || 'Unknown';
        portfolioBrowserCounts.set(browser, (portfolioBrowserCounts.get(browser) || 0) + 1);
      });

      // Format data for charts
      const viewsChartData = Array.from(viewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const portfolioViewsChartData = Array.from(portfolioViewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const browserStats = Array.from(browserCounts.entries())
        .map(([browser, views]) => ({
          browser,
          views,
          percentage: (views / totalVideoViews) * 100
        }))
        .sort((a, b) => b.views - a.views);

      const portfolioBrowserStats = Array.from(portfolioBrowserCounts.entries())
        .map(([browser, views]) => ({
          browser,
          views,
          percentage: (views / totalPortfolioViews) * 100
        }))
        .sort((a, b) => b.views - a.views);

      return {
        videoViews: {
          total: totalVideoViews,
          chartData: viewsChartData,
          browserStats
        },
        portfolioViews: {
          total: totalPortfolioViews,
          chartData: portfolioViewsChartData,
          browserStats: portfolioBrowserStats
        }
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
            <BrowserStats stats={analyticsData.videoViews.browserStats} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Portfolio Analytics</h3>
          <ViewsChart data={analyticsData.portfolioViews.chartData} />
          <div className="mt-4">
            <BrowserStats stats={analyticsData.portfolioViews.browserStats} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
