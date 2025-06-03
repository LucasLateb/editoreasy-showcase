
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, categories as localCategories } from '@/types';

export const useCategoriesWithFallback = (videos?: any[], onlyWithVideos: boolean = false) => {
  const [categories, setCategories] = useState<Category[]>(localCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        
        // Always start with local categories as fallback
        let finalCategories = [...localCategories];

        try {
          // Try to fetch from database, but don't fail if it doesn't work
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

          if (!error && data && data.length > 0) {
            // Map database categories
            const dbCategories = data.map(cat => ({
              id: cat.id,
              name: cat.name,
              description: '',
              thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
            }));

            // Merge with local categories
            const mergedCategories = [...dbCategories];
            
            // Add local categories that are not in the DB
            localCategories.forEach(localCat => {
              if (!dbCategories.find(dbCat => dbCat.id === localCat.id)) {
                mergedCategories.push(localCat);
              }
            });

            finalCategories = mergedCategories;
          }
        } catch (dbError) {
          // If database fetch fails, just use local categories
          console.warn('Database categories fetch failed, using local categories:', dbError);
        }

        console.log('useCategoriesWithFallback - finalCategories:', finalCategories);

        // Apply filtering if needed and videos are available
        if (videos && onlyWithVideos && videos.length > 0) {
          const categoriesWithVideos = new Set(videos.map(video => video.categoryId));
          finalCategories = finalCategories.filter(cat => categoriesWithVideos.has(cat.id));
        }

        // Sort categories by video count if videos are provided
        if (videos && videos.length > 0) {
          const videosCountByCategory = videos.reduce((acc: {[key: string]: number}, video) => {
            acc[video.categoryId] = (acc[video.categoryId] || 0) + 1;
            return acc;
          }, {});
          
          const categoriesWithVideos = finalCategories.filter(cat => videosCountByCategory[cat.id] > 0);
          const categoriesWithoutVideos = finalCategories.filter(cat => !videosCountByCategory[cat.id]);
          
          categoriesWithVideos.sort((a, b) => (videosCountByCategory[b.id] || 0) - (videosCountByCategory[a.id] || 0));
          
          finalCategories = onlyWithVideos ? categoriesWithVideos : [...categoriesWithVideos, ...categoriesWithoutVideos];
        }

        setCategories(finalCategories);
        setError(null);
      } catch (err) {
        console.error('Error in useCategoriesWithFallback:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        
        // Always fallback to local categories
        let fallbackCategories = localCategories;
        
        if (onlyWithVideos && videos && videos.length > 0) {
          const categoriesWithVideos = new Set(videos.map(video => video.categoryId));
          fallbackCategories = localCategories.filter(cat => categoriesWithVideos.has(cat.id));
        }
        
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [videos, onlyWithVideos]);

  const getCategoryById = (id: string) => {
    console.log('getCategoryById - looking for id:', id);
    console.log('getCategoryById - available categories:', categories);
    
    // Always check both current categories and local categories
    const found = categories.find(cat => cat.id === id) || localCategories.find(cat => cat.id === id);
    console.log('getCategoryById - found category:', found);
    
    return found;
  };

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase()) || 
           localCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  };

  return { categories, isLoading, error, getCategoryById, getCategoryByName };
};
