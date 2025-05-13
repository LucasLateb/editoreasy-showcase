
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category, categories } from '@/types';
import { toast } from 'sonner';

export type ExploreVideoType = {
  id: string;
  title: string;
  editor: string;
  thumbnail: string;
  views: number;
  likes: number;
  date: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  categoryId: string;
  categoryName?: string;
  userId: string;
  createdAt: Date;
  editorName?: string;
  editorAvatar?: string;
  editorTier?: 'free' | 'premium' | 'pro';
  isHighlighted?: boolean;
};

export const useVideos = (selectedCategory: Category | null) => {
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast: uiToast } = useToast();

  useEffect(() => {
    let isMounted = true; // Track component mount state
    setIsLoading(true); // Set loading to true immediately on category change
    
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos, selected category:', selectedCategory?.name);
        
        let query = supabase
          .from('videos')
          .select(`
            id, 
            title, 
            description, 
            video_url, 
            thumbnail_url, 
            views, 
            likes, 
            category_id, 
            user_id, 
            created_at,
            is_highlighted
          `);
        
        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory.id);
        }
        
        const { data: videoData, error: videoError } = await query.order('created_at', { ascending: false });
        
        if (videoError) {
          console.error('Error fetching videos:', videoError);
          throw videoError;
        }

        console.log('Video data received:', videoData?.length || 0);

        if (!videoData || videoData.length === 0) {
          if (isMounted) {
            setVideos([]);
            setIsLoading(false);
          }
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast('Failed to load videos', {
            description: 'Could not retrieve videos from the database.',
          });
          return;
        }
        
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
        
        const formattedVideos = videoData.map(video => {
          const profile = profilesMap[video.user_id] || {};
          const categoryInfo = categories.find(c => c.id === video.category_id);
          
          let editorTier: 'free' | 'premium' | 'pro' = 'free';
          if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
            editorTier = profile.subscription_tier as 'premium' | 'pro';
          }
          
          return {
            id: video.id,
            title: video.title,
            description: video.description,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url || '/placeholder.svg',
            thumbnail: video.thumbnail_url || '/placeholder.svg', // For compatibility
            views: video.views || 0,
            likes: video.likes || 0,
            categoryId: video.category_id,
            categoryName: categoryInfo?.name,
            userId: video.user_id,
            createdAt: new Date(video.created_at),
            date: new Date(video.created_at).toISOString().split('T')[0],
            editorName: profile.name || 'Unknown Editor',
            editor: profile.name || 'Unknown Editor', // For compatibility
            editorAvatar: profile.avatar_url || undefined,
            editorTier: editorTier,
            isHighlighted: video.is_highlighted || false,
          };
        });

        console.log('Formatted videos:', formattedVideos.length);
        
        if (isMounted) {
          setVideos(formattedVideos);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast('Failed to load videos', {
          description: 'Could not retrieve videos from the database.',
        });
        
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVideos();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [uiToast, selectedCategory]);

  return {
    videos,
    isLoading
  };
};
