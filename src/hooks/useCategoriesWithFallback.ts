
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

  return { categories, isLoading, error, getCategoryById, getCategoryByName };
};
