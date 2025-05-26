
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
      
      // Récupération des informations du navigateur et appareil de façon sécurisée
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      // Utilisation du RPC avec paramètres explicites pour éviter les problèmes de search_path
      const { error } = await supabase.rpc('record_video_view', {
        video_id_param: videoId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
      
      if (error) {
        console.error('Error in record_video_view RPC:', error);
      } else {
        console.log('Video view recorded successfully');
      }
    } catch (error) {
      console.error('Error recording video view:', error);
    }
  }, [currentUser]);

  const recordPortfolioView = useCallback(async (portfolioUserId: string) => {
    try {
      if (!portfolioUserId) {
        return;
      }
      
      const viewerId = currentUser?.id || null;
      
      // Ne pas enregistrer si l'utilisateur consulte son propre portfolio
      if (viewerId && viewerId === portfolioUserId) {
        return;
      }
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      const { error } = await supabase.rpc('record_portfolio_view', {
        portfolio_user_id_param: portfolioUserId,
        viewer_id_param: viewerId,
        device_type_param: deviceType,
        browser_param: browser
      });
      
      if (error) {
        console.error('Error in record_portfolio_view RPC:', error);
      }
    } catch (error) {
      console.error('Error recording portfolio view:', error);
    }
  }, [currentUser]);

  return { recordVideoView, recordPortfolioView };
};

// Fonctions d'assistance pour détecter le navigateur et le type d'appareil de manière sécurisée
const getBrowserInfo = () => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('edg')) return 'Edge';
    if (userAgent.includes('chrome')) return 'Chrome';
    if (userAgent.includes('safari')) return 'Safari';
    if (userAgent.includes('opera')) return 'Opera';
    return 'Other';
  } catch (error) {
    console.error('Error detecting browser:', error);
    return 'Unknown';
  }
};

const getDeviceType = () => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      return 'Mobile';
    }
    if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
      return 'Tablet';
    }
    return 'Desktop';
  } catch (error) {
    console.error('Error detecting device type:', error);
    return 'Unknown';
  }
};

export default useViewTracking;
