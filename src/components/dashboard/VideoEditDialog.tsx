
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Category } from '@/types';
import { useForm } from 'react-hook-form';
import { Loader2, ImageIcon } from 'lucide-react';

interface VideoEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VideoEditFormData) => Promise<void>;
  video: {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    thumbnailUrl: string;
  };
  categories: Category[];
  isLoading?: boolean;
}

export interface VideoEditFormData {
  title: string;
  description: string;
  categoryId: string;
  thumbnailUrl: string;
}

const VideoEditDialog: React.FC<VideoEditDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  video,
  categories,
  isLoading = false
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<VideoEditFormData>({
    defaultValues: {
      title: video.title,
      description: video.description,
      categoryId: video.categoryId,
      thumbnailUrl: video.thumbnailUrl
    }
  });

  const selectedCategoryId = watch('categoryId');
  const thumbnailUrl = watch('thumbnailUrl');

  const handleFormSubmit = async (data: VideoEditFormData) => {
    await onSubmit(data);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('thumbnailUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edit Video Details</DialogTitle>
          <DialogDescription>
            Update the information for your video.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto pr-4">
            <div className="space-y-6 pb-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter video title"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Enter video description"
                  className="min-h-[100px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => setValue('categoryId', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="flex flex-col space-y-4">
                  <div className="relative aspect-video w-full rounded-lg border overflow-hidden bg-muted">
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt="Video thumbnail"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={onClose} type="button" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoEditDialog;
