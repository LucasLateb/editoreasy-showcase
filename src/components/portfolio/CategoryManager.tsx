
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Category } from '@/types';

interface CategoryManagerProps {
  userCategories: Category[];
  moveCategory: (index: number, direction: 'up' | 'down') => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  userCategories,
  moveCategory
}) => {
  return (
    <div className="mt-6 bg-background rounded-2xl shadow-sm p-6 border border-border">
      <h3 className="font-medium mb-4">Manage Categories</h3>
      <div className="space-y-2">
        {userCategories.map((category, index) => (
          <div key={category.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
            <span>{category.name}</span>
            <div className="flex space-x-1">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => moveCategory(index, 'up')}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => moveCategory(index, 'down')}
                disabled={index === userCategories.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
