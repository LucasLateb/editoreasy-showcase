
import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface EmptyStateProps {
  selectedCategory: Category | null;
  onClearCategory: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ selectedCategory, onClearCategory }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Search className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No videos found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {selectedCategory 
          ? `No videos available for the "${selectedCategory.name}" category.`
          : "No videos available yet. Check back later or try a different search."}
      </p>
      {selectedCategory && (
        <Button variant="outline" onClick={onClearCategory}>
          Show all videos
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
