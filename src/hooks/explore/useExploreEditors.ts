
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EditorType } from '@/types/exploreTypes';
import { useToast } from '@/hooks/use-toast';

export const useExploreEditors = () => {
  const { toast } = useToast();
  
  const [editors, setEditors] = useState<EditorType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const isMounted = useRef(true);
  const editorsFetchedRef = useRef(false);

  // Handle component mounting/unmounting
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch editors once
  useEffect(() => {
    const fetchEditors = async () => {
      // Skip if already fetched or fetching
      if (editorsFetchedRef.current) return;
      editorsFetchedRef.current = true;
      
      if (isMounted.current) {
        setIsLoading(true);
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
          setIsLoading(false);
        }
      }
    };

    fetchEditors();
    
    return () => {
      editorsFetchedRef.current = false;
    };
  }, [toast]);

  return { editors, isLoading };
};
