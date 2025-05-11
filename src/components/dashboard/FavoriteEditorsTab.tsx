
import React from 'react';
import { Heart } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FavoriteEditorsTab = () => {
  const navigate = useNavigate();

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
      
      <Card>
        <CardHeader>
          <CardTitle>My Favorite Editors</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FavoriteEditorsTab;
