
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, categories as localCategories } from '@/types';

export const useCategoriesWithFallback = () => {
  const [categories, setCategories] = useState<Category[]>(localCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        if (data && data.length > 0) {
          // Mapper les catégories de la base de données
          const dbCategories = data.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: '',
            thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
          }));

          // Fusionner avec les catégories locales existantes
          const mergedCategories = [...dbCategories];
          
          // Ajouter les catégories locales qui ne sont pas dans la DB
          localCategories.forEach(localCat => {
            if (!dbCategories.find(dbCat => dbCat.id === localCat.id)) {
              mergedCategories.push(localCat);
            }
          });

          setCategories(mergedCategories);
        } else {
          // Fallback vers les catégories locales si la DB est vide
          setCategories(localCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        // Fallback vers les catégories locales en cas d'erreur
        setCategories(localCategories);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  };

  const getCategoriesSortedByVideoCount = async (userId?: string) => {
    try {
      // Récupérer le nombre de vidéos par catégorie
      let query = supabase
        .from('videos')
        .select('category_id');
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: videos, error } = await query;
      
      if (error) throw error;
      
      // Compter les vidéos par catégorie
      const categoryCounts = videos?.reduce((acc: { [key: string]: number }, video) => {
        acc[video.category_id] = (acc[video.category_id] || 0) + 1;
        return acc;
      }, {}) || {};
      
      // Trier les catégories par nombre de vidéos (ordre décroissant)
      const sortedCategories = categories
        .filter(cat => userId ? categoryCounts[cat.id] > 0 : true)
        .sort((a, b) => {
          const countA = categoryCounts[a.id] || 0;
          const countB = categoryCounts[b.id] || 0;
          return countB - countA;
        });
      
      return sortedCategories;
    } catch (error) {
      console.error('Error sorting categories by video count:', error);
      return categories;
    }
  };

  return { 
    categories, 
    isLoading, 
    error, 
    getCategoryById, 
    getCategoryByName,
    getCategoriesSortedByVideoCount 
  };
};
