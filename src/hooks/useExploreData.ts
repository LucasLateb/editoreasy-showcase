
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
  
  // Ajout d'un ref pour suivre si le composant est monté
  const isMounted = useRef(true);
  // Ajout d'un ref pour suivre si une requête est en cours
  const isLoadingRef = useRef(false);

  // Gestion du montage/démontage du composant
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch videos based on selected category
  useEffect(() => {
    // Éviter des requêtes multiples si une requête est déjà en cours
    if (isLoadingRef.current) return;
    
    const fetchVideos = async () => {
      // Marquer que le chargement a commencé
      isLoadingRef.current = true;
      setIsLoadingVideos(true);
      
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

        // Si le composant n'est plus monté, ne pas mettre à jour l'état
        if (!isMounted.current) return;

        if (!videoData || videoData.length === 0) {
          setVideos([]);
          setIsLoadingVideos(false);
          isLoadingRef.current = false;
          return;
        }

        const userIds = [...new Set(videoData.map(video => video.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, subscription_tier')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          toast({
            title: 'Failed to load videos',
            description: 'Could not retrieve videos from the database.',
            variant: 'destructive',
          });
          isLoadingRef.current = false;
          return;
        }
        
        // Si le composant n'est plus monté, ne pas mettre à jour l'état
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
        
        setVideos(formattedVideos);
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
      }
    };

    fetchVideos();
  }, [toast, selectedCategory]);

  // Fetch editors
  useEffect(() => {
    // N'exécuter cette requête qu'une seule fois
    let hasRun = false;
    
    const fetchEditors = async () => {
      if (hasRun || isLoadingRef.current) return;
      hasRun = true;
      
      setIsLoadingEditors(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, subscription_tier, role')
          .eq('role', 'monteur') // Only fetch editors (monteurs), not clients
          .order('name');
        
        if (error) {
          throw error;
        }
        
        // Si le composant n'est plus monté, ne pas mettre à jour l'état
        if (!isMounted.current) return;
        
        const editorsData = data.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unnamed Editor',
          subscription_tier: profile.subscription_tier,
          role: profile.role
        }));
        
        setEditors(editorsData);
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
  }, [toast]);

  return { videos, isLoadingVideos, editors, isLoadingEditors };
};
