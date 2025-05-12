
import React, { useState, useEffect } from 'react';
import { Heart, Search } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEditorFavorites } from '@/hooks/useEditorFavorites';
import { User } from '@/types';
import EditorCard from '@/components/EditorCard';
import { useAuth } from '@/contexts/AuthContext';

const FavoriteEditorsTab = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchFavoriteEditors } = useEditorFavorites();
  const [favoriteEditors, setFavoriteEditors] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavoriteEditors = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching favorite editors...');
        const editors = await fetchFavoriteEditors();
        console.log('Fetched editors:', editors);
        setFavoriteEditors(editors);
      } catch (error) {
        console.error('Error loading favorite editors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteEditors();
  }, [isAuthenticated, fetchFavoriteEditors]);

  // Filter editors based on search query
  const filteredEditors = searchQuery.trim() === ''
    ? favoriteEditors
    : favoriteEditors.filter(editor => 
        editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (editor.bio && editor.bio.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading favorite editors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Alert variant="default" className="mb-4">
        <AlertTitle>Find Video Editors</AlertTitle>
        <AlertDescription>
          Browse our collection of professional video editors and add your favorites to quickly access them later.
        </AlertDescription>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => navigate('/explore')}
        >
          Explore Editors
        </Button>
      </Alert>
      
      {favoriteEditors.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search favorite editors..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>My Favorite Editors</CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteEditors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Heart className="h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No Favorites Yet</h2>
              <p className="text-muted-foreground max-w-md">
                You haven't added any video editors to your favorites yet. Explore our directory to find video editors that match your needs.
              </p>
              <Button
                onClick={() => navigate('/explore')}
                variant="outline"
              >
                Find Editors
              </Button>
            </div>
          ) : filteredEditors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No editors match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEditors.map((editor, index) => (
                <EditorCard 
                  key={editor.id}
                  editor={editor}
                  index={index}
                  specializations={[]}
                  about={editor.bio || ""}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoriteEditorsTab;
