
import { Category } from '@/types';
import { useExploreVideos } from './explore/useExploreVideos';
import { useExploreEditors } from './explore/useExploreEditors';
import { ExploreVideoType, EditorType } from '@/types/exploreTypes';

export type { ExploreVideoType, EditorType };

export const useExploreData = (selectedCategory: Category | null) => {
  // Use the refactored hooks with proper cleanup
  const { videos, isLoading: isLoadingVideos } = useExploreVideos(selectedCategory);
  const { editors, isLoading: isLoadingEditors } = useExploreEditors();

  return { 
    videos, 
    isLoadingVideos, 
    editors, 
    isLoadingEditors 
  };
};
