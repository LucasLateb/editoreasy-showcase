
import { Category } from '@/types';
import { useExploreVideos } from './explore/useExploreVideos';
import { useExploreEditors } from './explore/useExploreEditors';
import { ExploreVideoType, EditorType } from '@/types/exploreTypes';
import { useEffect } from 'react';

export type { ExploreVideoType, EditorType };

export const useExploreData = (selectedCategory: Category | null) => {
  // Use the refactored hooks with proper cleanup
  const { videos, isLoading: isLoadingVideos } = useExploreVideos(selectedCategory);
  const { editors, isLoading: isLoadingEditors } = useExploreEditors();

  // Debug logging
  useEffect(() => {
    console.log('useExploreData - Editors count:', editors?.length || 0);
    console.log('useExploreData - Editors loading:', isLoadingEditors);
  }, [editors, isLoadingEditors]);

  return { 
    videos, 
    isLoadingVideos, 
    editors: editors || [], 
    isLoadingEditors 
  };
};
