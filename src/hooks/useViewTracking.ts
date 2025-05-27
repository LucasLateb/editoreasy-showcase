import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useViewTracking = () => {
  const { currentUser } = useAuth();

  const recordVideoView = useCallback(async (videoId: string) => {
    try {
      if (!videoId) {
        console.error('useViewTracking: videoId manquant pour le suivi.');
        return;
      }
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      console.log(`useViewTracking: Enregistrement de la vue vidéo pour ${videoId}, spectateur: ${currentUser?.id || 'anonyme'}, navigateur: ${browser}, appareil: ${deviceType}`);
      const { error } = await supabase.rpc('record_video_view', {
        video_id_param: videoId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
      
      if (error) {
        console.error('useViewTracking: Erreur lors de l\'appel RPC record_video_view:', error);
        throw error;
      }
      
      console.log(`useViewTracking: Vue vidéo (ID: ${videoId}) enregistrée avec succès via RPC.`);
    } catch (error) {
      console.error('useViewTracking: Erreur dans le hook recordVideoView:', error);
    }
  }, [currentUser]);

  const recordPortfolioView = useCallback(async (portfolioUserId: string) => {
    try {
      if (!portfolioUserId) {
        console.error('useViewTracking: portfolioUserId manquant pour le suivi.');
        return;
      }
      
      if (currentUser?.id === portfolioUserId) {
        console.log(`useViewTracking: Visualisation du propre portfolio (ID: ${portfolioUserId}), enregistrement ignoré.`);
        return;
      }
      
      const browser = getBrowserInfo();
      const deviceType = getDeviceType();
      
      console.log(`useViewTracking: Enregistrement de la vue portfolio pour ${portfolioUserId}, spectateur: ${currentUser?.id || 'anonyme'}, navigateur: ${browser}, appareil: ${deviceType}`);
      const { error } = await supabase.rpc('record_portfolio_view', {
        portfolio_user_id_param: portfolioUserId,
        viewer_id_param: currentUser?.id || null,
        device_type_param: deviceType,
        browser_param: browser
      });
      
      if (error) {
        console.error('useViewTracking: Erreur lors de l\'appel RPC record_portfolio_view:', error);
        throw error;
      }
      
      console.log(`useViewTracking: Vue du portfolio (ID: ${portfolioUserId}) enregistrée avec succès via RPC.`);
    } catch (error) {
      console.error('useViewTracking: Erreur dans le hook recordPortfolioView:', error);
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
    console.error('Erreur lors de la détection du navigateur:', error);
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
    console.error('Erreur lors de la détection du type d\'appareil:', error);
    return 'Unknown';
  }
};

export default useViewTracking;
