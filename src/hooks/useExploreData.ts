
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
  userId: string;
  createdAt: Date;
  editorName?: string;
  editorAvatar?: string;
  editorTier?: 'free' | 'premium' | 'pro';
  isHighlighted?: boolean;
};

export type EditorType = {
  id: string;
  name: string | null;
  subscription_tier: string | null;
  role?: string;
  specialization?: string;
};

export const useExploreData = (selectedCategory: Category | null) => {
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<ExploreVideoType[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoadingEditors, setIsLoadingEditors] = useState(false);
  
  // Add refs to track component mount state and prevent multiple requests
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);
  const initialLoadComplete = useRef(false);
  const editorsFetchedRef = useRef(false);

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
        setIsLoadingVideos(true);
      }
      
      try {
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

        // Stop if component unmounted
        if (!isMounted.current) return;

        if (!videoData || videoData.length === 0) {
          setVideos([]);
          if (isMounted.current) {
            setIsLoadingVideos(false);
          }
          isLoadingRef.current = false;
          initialLoadComplete.current = true;
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id))];
        
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
          }
          isLoadingRef.current = false;
          initialLoadComplete.current = true;
          return;
        }
        
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
          
          return {
            id: video.id,
            title: video.title,
            description: video.description,
            videoUrl: video.video_url,
            thumbnailUrl: video.thumbnail_url || '/placeholder.svg',
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
            thumbnail: video.thumbnail_url || '/placeholder.svg',
          };
        });
        
        if (isMounted.current) {
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
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingVideos(false);
        }
        isLoadingRef.current = false;
        initialLoadComplete.current = true;
      }
    };

    fetchVideos();
  }, [toast, selectedCategory]);

  // Fetch editors once, with better tracking
  useEffect(() => {
    const fetchEditors = async () => {
      // Skip if already fetched or fetching
      if (editorsFetchedRef.current || isLoadingRef.current) return;
      editorsFetchedRef.current = true;
      
      if (isMounted.current) {
        setIsLoadingEditors(true);
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, subscription_tier, role')
          .eq('role', 'monteur')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        // Stop if component unmounted
        if (!isMounted.current) return;
        
        const editorsData = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unnamed Editor',
          subscription_tier: profile.subscription_tier,
          role: profile.role
        }));
        
        if (isMounted.current) {
          setEditors(editorsData);
        }
      } catch (error) {
        console.error('Error fetching editors:', error);
        if (isMounted.current) {
          toast({
            title: 'Failed to load editors',
            description: 'Could not retrieve editor profiles from the database.',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoadingEditors(false);
        }
      }
    };

    fetchEditors();
    
    return () => {
      editorsFetchedRef.current = false;
    };
  }, [toast]);

  return { 
    videos, 
    isLoadingVideos, 
    editors, 
    isLoadingEditors 
  };
};
