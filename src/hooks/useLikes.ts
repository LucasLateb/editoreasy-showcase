
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Hook for handling video likes
export const useVideoLikes = (videoId: string, initialLikesCount: number) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the video is already liked by the current user
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the RPC function we created to check if the video is liked
        const { data, error } = await supabase
          .rpc('check_video_like', {
            video_id_param: videoId,
            user_id_param: currentUser.id
          })
          .single();

        if (error) throw error;
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking video like status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfLiked();
  }, [videoId, currentUser, isAuthenticated]);

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('You need to be signed in to like videos');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        setLikesCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('video_likes')
          .insert({
            video_id: videoId,
            user_id: currentUser.id
          });

        if (error) {
          if (error.code === '23505') { // Unique violation
            setIsLiked(true);
            return;
          }
          throw error;
        }
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling video like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  }, [videoId, isLiked, currentUser, isAuthenticated]);

  return { isLiked, likesCount, isLoading, toggleLike };
};

// Hook for handling profile likes
export const useProfileLikes = (profileId: string, initialLikesCount: number) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the profile is already liked by the current user
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!isAuthenticated || !currentUser || profileId === currentUser.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Use the RPC function we created to check if the profile is liked
        const { data, error } = await supabase
          .rpc('check_profile_like', {
            profile_id_param: profileId,
            user_id_param: currentUser.id
          })
          .single();

        if (error) throw error;
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking profile like status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfLiked();
  }, [profileId, currentUser, isAuthenticated]);

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('You need to be signed in to like profiles');
      return;
    }

    if (profileId === currentUser.id) {
      toast.error('You cannot like your own profile');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('profile_likes')
          .delete()
          .eq('profile_id', profileId)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        setLikesCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('profile_likes')
          .insert({
            profile_id: profileId,
            user_id: currentUser.id
          });

        if (error) {
          if (error.code === '23505') { // Unique violation
            setIsLiked(true);
            return;
          }
          throw error;
        }
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling profile like:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  }, [profileId, isLiked, currentUser, isAuthenticated]);

  return { isLiked, likesCount, isLoading, toggleLike };
};
