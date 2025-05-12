
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { User } from '@/types';

export const useEditorFavorites = (editorId?: string) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the editor is already favorited by the current user
  useEffect(() => {
    const checkIfFavorited = async () => {
      if (!isAuthenticated || !currentUser || !editorId) {
        setIsLoading(false);
        return;
      }

      try {
        // Direct database query instead of using RPC function
        const { data, error } = await supabase
          .from('editor_favorites')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('editor_id', editorId)
          .maybeSingle();

        if (error && error.code !== 'PGSQL_RELATION_DOES_NOT_EXIST') {
          console.error('Error checking favorite status:', error);
        }
        
        setIsFavorited(!!data);
      } catch (error) {
        console.error('Error checking if editor is favorited:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfFavorited();
  }, [editorId, currentUser, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('You need to be signed in to favorite editors');
      return;
    }

    if (!editorId) {
      toast.error('Invalid editor');
      return;
    }

    if (currentUser.id === editorId) {
      toast.error('You cannot favorite yourself');
      return;
    }

    // Check if the current user is a client
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (profileData?.role !== 'client') {
      toast.error('Only clients can favorite editors');
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('editor_favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('editor_id', editorId);

        if (error) throw error;
        setIsFavorited(false);
        toast.success('Editor removed from favorites');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('editor_favorites')
          .insert({
            user_id: currentUser.id,
            editor_id: editorId
          });

        if (error) {
          if (error.code === '23505') { // Unique violation
            setIsFavorited(true);
            return;
          }
          throw error;
        }
        setIsFavorited(true);
        toast.success('Editor added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      toast.error('Failed to update favorite status');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch favorite editors for the current user
  const fetchFavoriteEditors = async (): Promise<User[]> => {
    if (!isAuthenticated || !currentUser) {
      return [];
    }

    try {
      // First fetch the favorite relationships
      const { data: favoriteRelations, error: favError } = await supabase
        .from('editor_favorites')
        .select('editor_id')
        .eq('user_id', currentUser.id);

      if (favError) throw favError;
      
      if (!favoriteRelations || favoriteRelations.length === 0) {
        return [];
      }

      // Then fetch the editor profiles based on the favorite relations
      const editorIds = favoriteRelations.map(relation => relation.editor_id);
      
      const { data: editors, error: editorsError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', editorIds);

      if (editorsError) throw editorsError;
      
      // Format the data to match the User type
      return editors.map(editor => ({
        id: editor.id,
        name: editor.name || '',
        email: editor.email || '',
        avatarUrl: editor.avatar_url || '',
        bio: editor.bio || '',
        createdAt: new Date(editor.created_at || Date.now()),
        subscriptionTier: (editor.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
        role: editor.role || 'monteur',
        likes: editor.likes || 0
      }));
    } catch (error) {
      console.error('Error fetching favorite editors:', error);
      toast.error('Failed to load favorite editors');
      return [];
    }
  };

  return { isFavorited, isLoading, toggleFavorite, fetchFavoriteEditors };
};
