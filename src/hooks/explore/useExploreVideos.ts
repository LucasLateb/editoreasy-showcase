
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { ExploreVideoType } from '@/types/exploreTypes';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

export const useExploreVideos = (selectedCategory: Category | null) => {
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add refs to track component mount state and prevent multiple requests
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const initialLoadComplete = useRef(false);

  // Handle component mounting/unmounting
  useEffect(() => {
    isMounted.current = true;
    initialLoadComplete.current = false;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch videos based on selected category
  useEffect(() => {
    // Skip if already loading to prevent multiple concurrent requests
    if (isLoadingRef.current) return;
    
    const fetchVideos = async () => {
      // Mark loading as started
      isLoadingRef.current = true;
      if (isMounted.current) {
        setIsLoading(true);
      }
      
      try {
        console.log('Fetching videos...');
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
          throw videoError;
        }

        console.log(`Fetched ${videoData?.length || 0} videos`);

        // Stop if component unmounted
        if (!isMounted.current) return;

        if (!videoData || videoData.length === 0) {
          setVideos([]);
          if (isMounted.current) {
            setIsLoading(false);
          }
          isLoadingRef.current = false;
          initialLoadComplete.current = true;
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id))];
        console.log(`Found ${userIds.length} unique user IDs`);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          if (isMounted.current) {
            toast({
              title: 'Failed to load videos',
              description: 'Could not retrieve videos from the database.',
              variant: 'destructive',
            });
            
            // Also use sonner toast for more visibility
            sonnerToast.error('Failed to load videos', 'Could not retrieve videos from the database.');
          }
          isLoadingRef.current = false;
          initialLoadComplete.current = true;
          return;
        }
        
        console.log(`Fetched ${profilesData?.length || 0} profiles`);
        
        // Stop if component unmounted
        if (!isMounted.current) return;
        
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
        
        const formattedVideos = videoData.map(video => {
          const profile = profilesMap[video.user_id] || {};
          
          let editorTier: 'free' | 'premium' | 'pro' = 'free';
          if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
            editorTier = profile.subscription_tier as 'premium' | 'pro';
          }
          
          // Ensure thumbnailUrl is not null
          const thumbnailUrl = video.thumbnail_url || '/placeholder.svg';
          console.log(`Video ${video.id} thumbnail: ${thumbnailUrl}`);
          
          return {
            id: video.id,
            title: video.title,
            description: video.description,
            videoUrl: video.video_url,
            thumbnailUrl: thumbnailUrl,
            views: video.views || 0,
            likes: video.likes || 0,
            categoryId: video.category_id,
            userId: video.user_id,
            createdAt: new Date(video.created_at),
            date: new Date(video.created_at).toISOString().split('T')[0],
            editorName: profile.name || 'Unknown Editor',
            editorAvatar: profile.avatar_url || undefined,
            editorTier: editorTier,
            isHighlighted: video.is_highlighted || false,
            editor: profile.name || 'Unknown Editor',
            thumbnail: thumbnailUrl,
          };
        });
        
        if (isMounted.current) {
          console.log(`Setting ${formattedVideos.length} formatted videos`);
          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
        if (isMounted.current) {
          toast({
            title: 'Failed to load videos',
            description: 'Could not retrieve videos from the database.',
            variant: 'destructive',
          });
          
          // Also use sonner toast for more visibility
          sonnerToast.error('Failed to load videos', 'Could not retrieve videos from the database.');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
        isLoadingRef.current = false;
        initialLoadComplete.current = true;
      }
    };

    fetchVideos();
  }, [toast, selectedCategory]);

  return { videos, isLoading };
};
