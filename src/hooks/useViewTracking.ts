
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useViewTracking = () => {
  const { currentUser } = useAuth();

  const recordVideoView = useCallback(async (videoId: string) => {
    try {
      if (!videoId) {
        console.error('Missing videoId for tracking');
        return;
      }
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      await supabase.rpc('record_video_view', {
        video_id_param: videoId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
      console.log('Video view recorded successfully');
    } catch (error) {
      console.error('Error recording video view:', error);
    }
  }, [currentUser]);

  const recordPortfolioView = useCallback(async (portfolioUserId: string) => {
    try {
      if (!portfolioUserId) {
        console.error('Missing portfolioUserId for tracking');
        return;
      }
      
      // Don't record if viewing own portfolio
      if (currentUser?.id === portfolioUserId) {
        console.log('Skipping view recording for own portfolio');
        return;
      }
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      await supabase.rpc('record_portfolio_view', {
        portfolio_user_id_param: portfolioUserId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
      console.log('Portfolio view recorded successfully');
    } catch (error) {
      console.error('Error recording portfolio view:', error);
    }
  }, [currentUser]);

  return { recordVideoView, recordPortfolioView };
};

// Helper functions to detect browser and device info
const getBrowserInfo = () => {
  try {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  } catch (error) {
    console.error('Error detecting browser:', error);
    return 'Unknown';
  }
};

const getDeviceType = () => {
  try {
    const userAgent = navigator.userAgent;
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'Mobile';
    }
    if (/iPad|Android|Tablet/.test(userAgent)) {
      return 'Tablet';
    }
    return 'Desktop';
  } catch (error) {
    console.error('Error detecting device type:', error);
    return 'Unknown';
  }
};

export default useViewTracking;
