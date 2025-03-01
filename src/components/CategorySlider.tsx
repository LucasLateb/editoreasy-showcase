
import React, { useState, useRef } from 'react';
import { categories, Category } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategorySliderProps {
  onSelectCategory?: (category: Category) => void;
  selectedCategoryId?: string;
}

const CategorySlider: React.FC<CategorySliderProps> = ({ 
  onSelectCategory,
  selectedCategoryId 
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  return (
    <div className="relative w-full">
      {showLeftArrow && (
        <Button 
          onClick={scrollLeft} 
          size="icon" 
          variant="ghost" 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x space-x-2 py-4 px-2"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex-none pl-2">
          <button
            onClick={() => onSelectCategory?.(undefined as any)}
            className={cn(
              "category-button", 
              !selectedCategoryId && "active"
            )}
          >
            All Categories
          </button>
        </div>
        
        {categories.map((category) => (
          <div key={category.id} className="flex-none">
            <button
              onClick={() => onSelectCategory?.(category)}
              className={cn(
                "category-button",
                selectedCategoryId === category.id && "active"
              )}
            >
              {category.name}
            </button>
          </div>
        ))}
      </div>
      
      {showRightArrow && (
        <Button 
          onClick={scrollRight} 
          size="icon" 
          variant="ghost" 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default CategorySlider;
