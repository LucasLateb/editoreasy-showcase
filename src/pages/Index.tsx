
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import CategorySlider from '@/components/CategorySlider';
import EditorCard from '@/components/EditorCard';
import { categories } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  // Fetch editors with their portfolio data
  const { data: editorsWithPortfolios, isLoading } = useQuery({
    queryKey: ['popularEditors'],
    queryFn: async () => {
      try {
        // First, get profiles data
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('likes', { ascending: false })
          .limit(8);

        if (profilesError) {
          throw profilesError;
        }

        // Map the profiles to User type
        const editors: User[] = profilesData.map((profile: any) => ({
          id: profile.id,
          name: profile.name || 'Unknown Editor',
          email: profile.email || '',
          avatarUrl: profile.avatar_url || '',
          bio: profile.bio || '',
          subscriptionTier: profile.subscription_tier || 'free',
          likes: profile.likes || 0,
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
        }));

        // Get portfolio settings for each editor
        const portfolioPromises = editors.map(async (editor) => {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('portfolio_settings')
            .select('showreel_url, showreel_thumbnail')
            .eq('user_id', editor.id)
            .maybeSingle();

          if (portfolioError) {
            console.error('Error fetching portfolio for editor', editor.id, portfolioError);
            return { editor, showreelUrl: null, showreelThumbnail: null };
          }

          return {
            editor,
            showreelUrl: portfolioData?.showreel_url || null,
            showreelThumbnail: portfolioData?.showreel_thumbnail || null,
          };
        });

        return Promise.all(portfolioPromises);
      } catch (error) {
        console.error('Error fetching editors with portfolios:', error);
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      <div className="container mx-auto px-4 pb-16">
        {/* Categories Section */}
        <section className="mt-10 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Explore Categories</h2>
            <Link to="/explore" className="text-primary hover:text-primary/80 text-sm font-medium">
              View All
            </Link>
          </div>
          <CategorySlider categories={categories} />
        </section>

        {/* Popular Editors Section */}
        <section className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Popular Editors</h2>
            <Link to="/explore" className="text-primary hover:text-primary/80 text-sm font-medium">
              Explore More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading state
              Array.from({ length: 8 }).map((_, index) => (
                <div 
                  key={index} 
                  className="p-5 rounded-2xl bg-muted/50 animate-pulse h-[250px]"
                >
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="ml-3 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-32 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))
            ) : editorsWithPortfolios && editorsWithPortfolios.length > 0 ? (
              // Display editors with portfolio data
              editorsWithPortfolios.map(({ editor, showreelUrl, showreelThumbnail }, index) => (
                <EditorCard 
                  key={editor.id} 
                  editor={editor} 
                  index={index}
                  showreelUrl={showreelUrl || undefined}
                  showreelThumbnail={showreelThumbnail || undefined}
                />
              ))
            ) : (
              // Fallback if no editors are found
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No editors found. Check back later!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
