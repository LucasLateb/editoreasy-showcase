
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useViewTracking = () => {
  const { currentUser } = useAuth();

  const recordVideoView = useCallback(async (videoId: string) => {
    try {
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      await supabase.rpc('record_video_view', {
        video_id_param: videoId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
    } catch (error) {
      console.error('Error recording video view:', error);
    }
  }, [currentUser]);

  const recordPortfolioView = useCallback(async (portfolioUserId: string) => {
    try {
      // Don't record if viewing own portfolio
      if (currentUser?.id === portfolioUserId) return;
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      await supabase.rpc('record_portfolio_view', {
        portfolio_user_id_param: portfolioUserId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
    } catch (error) {
      console.error('Error recording portfolio view:', error);
    }
  }, [currentUser]);

  return { recordVideoView, recordPortfolioView };
};

// Helper functions to detect browser and device info
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'Mobile';
  }
  if (/iPad|Android|Tablet/.test(userAgent)) {
    return 'Tablet';
  }
  return 'Desktop';
};

export default useViewTracking;
