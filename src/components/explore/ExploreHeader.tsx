
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import CategorySlider from '@/components/CategorySlider';
import { Category } from '@/types';

interface ExploreHeaderProps {
  onSelectCategory: (category: Category) => void;
  selectedCategory: Category | null;
  onOpenSearch: () => void;
  isAuthenticated: boolean;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  onSelectCategory,
  selectedCategory,
  onOpenSearch,
  isAuthenticated,
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl">Explore Videos</CardTitle>
        <CardDescription>
          Discover trending videos and talented editors
          {!isAuthenticated && (
            <span className="block text-sm mt-1 text-primary">
              Sign in to like videos and interact with editors
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="flex-grow">
            <CategorySlider 
              onSelectCategory={onSelectCategory}
              selectedCategoryId={selectedCategory?.id}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={onOpenSearch}
          >
            <Search className="h-4 w-4 mr-2" />
            Find Editors
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreHeader;
