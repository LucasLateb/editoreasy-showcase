
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
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        let finalCategories = [...localCategories];

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

          finalCategories = mergedCategories;
        }

        // Appliquer le filtre onlyWithVideos seulement si des vidéos sont fournies ET chargées
        if (videos && onlyWithVideos && videos.length > 0) {
          // Créer un Set des catégories qui ont des vidéos pour une recherche plus rapide
          const categoriesWithVideos = new Set(videos.map(video => video.categoryId));
          finalCategories = finalCategories.filter(cat => categoriesWithVideos.has(cat.id));
        }

        // Si des vidéos sont fournies, trier les catégories par nombre de vidéos
        if (videos && videos.length > 0) {
          // Compter le nombre de vidéos par catégorie
          const videosCountByCategory = videos.reduce((acc: {[key: string]: number}, video) => {
            acc[video.categoryId] = (acc[video.categoryId] || 0) + 1;
            return acc;
          }, {});
          
          // Séparer les catégories avec et sans vidéos
          const categoriesWithVideos = finalCategories.filter(cat => videosCountByCategory[cat.id] > 0);
          const categoriesWithoutVideos = finalCategories.filter(cat => !videosCountByCategory[cat.id]);
          
          // Trier les catégories avec vidéos par nombre décroissant
          categoriesWithVideos.sort((a, b) => (videosCountByCategory[b.id] || 0) - (videosCountByCategory[a.id] || 0));
          
          // Combiner : catégories avec vidéos d'abord, puis les autres (seulement si onlyWithVideos est false)
          finalCategories = onlyWithVideos ? categoriesWithVideos : [...categoriesWithVideos, ...categoriesWithoutVideos];
        }

        setCategories(finalCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        
        // Fallback vers les catégories locales en cas d'erreur
        let fallbackCategories = localCategories;
        
        if (onlyWithVideos && videos && videos.length > 0) {
          // Filtrer les catégories locales qui ont des vidéos
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
    return categories.find(cat => cat.id === id) || localCategories.find(cat => cat.id === id);
  };

  const getCategoryByName = (name: string) => {
    return categories.find(cat => cat.name.toLowerCase() === name.toLowerCase()) || 
           localCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
  };

  return { categories, isLoading, error, getCategoryById, getCategoryByName };
};
