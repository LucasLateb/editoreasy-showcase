
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ViewsChart from './analytics/ViewsChart';
import BrowserStats from './analytics/BrowserStats';
import { Loader2 } from 'lucide-react';

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

      // Fetch views over time
      const { data: viewsData, error: viewsError } = await supabase
        .from('video_views')
        .select('video_id, viewed_at, browser')
        .in('video_id', 
          // Fix: Extract ids from the subquery properly
          await supabase
            .from('videos')
            .select('id')
            .eq('user_id', currentUser.id)
            .then(({ data }) => data ? data.map(item => item.id) : [])
        );

      if (viewsError) throw viewsError;

      // Process views data
      const viewsByDate = new Map();
      const browserCounts = new Map();
      let totalViews = 0;

      viewsData?.forEach(view => {
        const date = new Date(view.viewed_at).toLocaleDateString();
        viewsByDate.set(date, (viewsByDate.get(date) || 0) + 1);
        
        const browser = view.browser || 'Unknown';
        browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
        totalViews++;
      });

      // Format data for charts
      const viewsChartData = Array.from(viewsByDate.entries())
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const browserStats = Array.from(browserCounts.entries())
        .map(([browser, views]) => ({
          browser,
          views,
          percentage: (views / totalViews) * 100
        }))
        .sort((a, b) => b.views - a.views);

      return {
        viewsChartData,
        browserStats,
        totalViews
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
          Start sharing your videos to see analytics data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background p-4 rounded-lg border border-border">
          <div className="text-muted-foreground text-sm mb-1">Total Views</div>
          <div className="text-3xl font-bold">{analyticsData.totalViews}</div>
        </div>
      </div>
      
      <ViewsChart data={analyticsData.viewsChartData} />
      <BrowserStats stats={analyticsData.browserStats} />
    </div>
  );
};

export default AnalyticsTab;
