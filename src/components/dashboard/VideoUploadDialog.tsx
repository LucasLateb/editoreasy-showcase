
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Category } from '@/types';
import { UploadCloud, LinkIcon, FileVideo, Image } from 'lucide-react';

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadFormData, videoFile: File | null, thumbnailFile: File | null) => void;
  categories: Category[];
  isUploading: boolean;
}

export interface UploadFormData {
  title: string;
  description: string;
  videoUrl: string;
  categoryId: string;
  thumbnailUrl: string;
  uploadType?: 'link' | 'file' | null;
}

const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isUploading
}) => {
  const [uploadType, setUploadType] = useState<'link' | 'file' | null>(null);
  const [uploadData, setUploadData] = useState<UploadFormData>({
    title: '',
    description: '',
    videoUrl: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    thumbnailUrl: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Predefined thumbnails for selection
  const predefinedThumbnails = [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    'https://images.unsplash.com/photo-1550745166-9bc0b2527af',
    'https://images.unsplash.com/photo-1550745167-9bc0b2528ab',
    'https://images.unsplash.com/photo-1550745168-9bc0b2529ac',
  ];

  const handleThumbnailSelect = (url: string) => {
    setUploadData({...uploadData, thumbnailUrl: url});
    setThumbnailPreview(url);
    setThumbnailFile(null);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setUploadData({...uploadData, thumbnailUrl: ''});
    }
  };

  const handleSubmit = () => {
    onSubmit({...uploadData, uploadType}, videoFile, thumbnailFile);
    // Reset form data
    setUploadData({
      title: '',
      description: '',
      videoUrl: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      thumbnailUrl: '',
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadType(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Upload New Video</DialogTitle>
          <DialogDescription>
            Add a new video to your portfolio. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Video Title</Label>
              <Input 
                id="title" 
                value={uploadData.title} 
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                placeholder="Enter a title for your video"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={uploadData.categoryId}
                onChange={(e) => setUploadData({...uploadData, categoryId: e.target.value})}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={uploadData.description} 
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                placeholder="Describe your video"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Video Source</Label>
              <div className="flex gap-4 mt-1">
                <Button 
                  type="button" 
                  variant={uploadType === 'link' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setUploadType('link')}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Video Link
                </Button>
                <Button 
                  type="button" 
                  variant={uploadType === 'file' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setUploadType('file')}
                >
                  <FileVideo className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>
            
            {uploadType === 'link' && (
              <div className="grid gap-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input 
                  id="videoUrl" 
                  value={uploadData.videoUrl} 
                  onChange={(e) => setUploadData({...uploadData, videoUrl: e.target.value})}
                  placeholder="Enter YouTube or Vimeo URL"
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, and other video hosting platforms
                </p>
              </div>
            )}
            
            {uploadType === 'file' && (
              <div className="grid gap-2">
                <Label htmlFor="videoFile">Video File</Label>
                <div className="border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {videoFile ? videoFile.name : 'Drag and drop or click to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP4, MOV, AVI (max 500MB)
                  </p>
                  <Input 
                    id="videoFile" 
                    type="file"
                    className="hidden"
                    accept=".mp4,.mov,.avi"
                    onChange={(e) => setVideoFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => document.getElementById('videoFile')?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>
            )}

            {/* Thumbnail Selection Section */}
            <div className="grid gap-2">
              <Label>Thumbnail</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Predefined thumbnails */}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-2">Select a thumbnail:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedThumbnails.map((thumbnail, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${uploadData.thumbnailUrl === thumbnail ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-muted'}`}
                        onClick={() => handleThumbnailSelect(thumbnail)}
                      >
                        <img 
                          src={thumbnail} 
                          alt={`Thumbnail ${index + 1}`} 
                          className="w-full h-16 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upload custom thumbnail */}
                <div className="col-span-2 mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Or upload your own:</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-input rounded-md p-3 flex flex-col items-center justify-center">
                        <Image className="h-5 w-5 text-muted-foreground mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {thumbnailFile ? thumbnailFile.name : 'Click to upload'}
                        </p>
                        <Input 
                          id="thumbnailFile" 
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                        />
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('thumbnailFile')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="border rounded-md overflow-hidden aspect-video">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="px-6 py-4">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!uploadData.title || (!uploadData.videoUrl && uploadType === 'link') || (!videoFile && uploadType === 'file') || !uploadType || (!uploadData.thumbnailUrl && !thumbnailFile)}
          >
            Upload Video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadDialog;
