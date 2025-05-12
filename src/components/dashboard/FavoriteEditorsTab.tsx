
import React, { useState, useEffect } from 'react';
import { Heart, Search, Mail, ExternalLink } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useEditorFavorites } from '@/hooks/useEditorFavorites';
import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

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
        editor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getBadgeVariant = (tier: 'free' | 'premium' | 'pro') => {
    switch (tier) {
      case 'pro':
        return 'default';
      case 'premium':
        return 'secondary';
      case 'free':
      default:
        return 'outline';
    }
  };

  const handleMessageClick = (editor: User) => {
    toast.success(`Your message to ${editor.name} has been sent.`);
  };

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
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredEditors.map((editor) => (
                  <div 
                    key={editor.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 transition-colors bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-background shadow">
                        <AvatarImage src={editor.avatarUrl} alt={editor.name} />
                        <AvatarFallback>{editor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-medium">{editor.name}</h3>
                        <Badge 
                          variant={getBadgeVariant(editor.subscriptionTier)} 
                          className="mt-1 text-xs w-fit"
                        >
                          {editor.subscriptionTier.charAt(0).toUpperCase() + editor.subscriptionTier.slice(1)}
                        </Badge>
                        {editor.favoritedAt && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Added {format(editor.favoritedAt, 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMessageClick(editor);
                        }}
                      >
                        <Mail className="h-4 w-4" /> 
                        <span className="ml-1 hidden sm:inline">Message</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/editor/${editor.id}`);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" /> 
                        <span className="ml-1 hidden sm:inline">Portfolio</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoriteEditorsTab;
