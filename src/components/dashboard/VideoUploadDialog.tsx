
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface UploadFormData {
  title: string;
  description: string;
  categoryId: string;
  videoUrl: string;
  thumbnailUrl: string;
  uploadType: 'url' | 'file';
}

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadFormData, videoFile: File | null, thumbnailFile: File | null) => void;
  isUploading?: boolean;
}

const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isUploading = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const { toast } = useToast();

  const isFormValid = title.trim() !== '' && description.trim() !== '' && categoryId !== '';

  const handleSubmit = () => {
    if (!isFormValid) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const data: UploadFormData = {
      title: title.trim(),
      description: description.trim(),
      categoryId: categoryId,
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      uploadType: uploadType,
    };

    onSubmit(data, videoFile, thumbnailFile);
  };

  const handleCloseDialog = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setVideoUrl('');
    setThumbnailUrl('');
    setUploadType('url');
    setVideoFile(null);
    setThumbnailFile(null);
    onClose();
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setThumbnailFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Add a new video to your portfolio by uploading a file or providing a URL
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategoryId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Animation</SelectItem>
                <SelectItem value="2">Commercial</SelectItem>
                <SelectItem value="3">Documentary</SelectItem>
                <SelectItem value="4">Music Video</SelectItem>
                <SelectItem value="5">Short Film</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uploadType" className="text-right">
              Upload Type
            </Label>
            <div className="col-span-3 flex items-center space-x-4">
              <Button 
                variant={uploadType === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadType('url')}
                size="sm"
              >
                URL
              </Button>
              <Button
                variant={uploadType === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadType('file')}
                size="sm"
              >
                File
              </Button>
            </div>
          </div>

          {uploadType === 'url' ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoUrl" className="text-right">
                  Video URL
                </Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnailUrl" className="text-right">
                  Thumbnail URL
                </Label>
                <Input
                  id="thumbnailUrl"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoFile" className="text-right">
                  Video File
                </Label>
                <Input
                  type="file"
                  id="videoFile"
                  className="col-span-3"
                  onChange={handleVideoFileChange}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnailFile" className="text-right">
                  Thumbnail File
                </Label>
                <Input
                  type="file"
                  id="thumbnailFile"
                  className="col-span-3"
                  onChange={handleThumbnailFileChange}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            type="button"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Video'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadDialog;
