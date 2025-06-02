
import React, { useState, useEffect } from 'react';
import { Video, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, PlusCircle } from 'lucide-react';
import VideoCardDashboard from './VideoCardDashboard';
import { supabase } from '@/integrations/supabase/client';

interface VideosTabProps {
  videos: Video[];
  categories: Category[];
  isLoading: boolean;
  onUploadClick: () => void;
  onDeleteClick: (videoId: string) => void;
}

const VideosTab: React.FC<VideosTabProps> = ({
  videos,
  categories: propCategories,
  isLoading,
  onUploadClick,
  onDeleteClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>(propCategories);

  // Fetch categories from database on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          const formattedCategories: Category[] = data.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: '',
            thumbnailUrl: ''
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use props categories as fallback
        setCategories(propCategories);
      }
    };

    fetchCategories();
  }, [propCategories]);

  // Filter videos based on search query and selected category
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || video.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get category stats
  const categoryStats = categories.map(category => ({
    ...category,
    count: videos.filter(video => video.categoryId === category.id).length
  }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={onUploadClick} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Category stats */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={selectedCategory === 'all' ? 'default' : 'secondary'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All ({videos.length})
        </Badge>
        {categoryStats.map(category => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.count})
          </Badge>
        ))}
      </div>

      {/* Videos grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="h-24 w-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <PlusCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">
            {videos.length === 0 ? 'No videos yet' : 'No videos found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {videos.length === 0 
              ? 'Start building your portfolio by uploading your first video.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {videos.length === 0 && (
            <Button onClick={onUploadClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Your First Video
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCardDashboard
              key={video.id}
              video={video}
              category={categories.find(cat => cat.id === video.categoryId)}
              onDelete={() => onDeleteClick(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideosTab;
