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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
// Import du composant Select
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Category } from '@/types';
import { UploadCloud, LinkIcon, FileVideo, Image, Youtube, Video, Loader2, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  videoSource?: 'youtube' | 'vimeo' | 'other' | null;
}

const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isUploading
}) => {
  const { toast } = useToast();

  // Les données de base pour l'upload
  const [uploadData, setUploadData] = useState<UploadFormData>({
    title: '',
    description: '',
    videoUrl: '',
    // Initialisation de la catégorie
    categoryId: categories.length > 0 ? categories[0].id : '',
    thumbnailUrl: '',
  });

  const [uploadType, setUploadType] = useState<'link' | 'file' | null>(null);
  const [videoSource, setVideoSource] = useState<'youtube' | 'vimeo' | 'other' | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // États pour la gestion des catégories personnalisées
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const predefinedThumbnails = [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    'https://images.unsplash.com/photo-1550745166-9bc0b2527af',
    'https://images.unsplash.com/photo-1550745167-9bc0b2528ab',
    'https://images.unsplash.com/photo-1550745168-9bc0b2529ac',
  ];

  const handleThumbnailSelect = (url: string) => {
    setUploadData({ ...uploadData, thumbnailUrl: url });
    setThumbnailPreview(url);
    setThumbnailFile(null);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        toast({
          title: 'Fichier trop volumineux',
          description: 'La miniature doit faire moins de 1Mo.',
          variant: 'destructive',
        });
        e.target.value = ''; // Reset file input
        return;
      }
      setThumbnailFile(file);
      const objectUrl = URL.createObjectURL(file);
      setThumbnailPreview(objectUrl);
      setUploadData({ ...uploadData, thumbnailUrl: '' }); // Clear pre-selected thumbnail
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        alert('Video file must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setUploadProgress(10);
    }
  };

  const handleCreateCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer un nom pour la catégorie.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingCategory(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: customCategoryName.trim() }])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la catégorie sélectionnée avec la nouvelle catégorie
      setUploadData({ ...uploadData, categoryId: data.id });
      setShowCustomCategory(false);
      setCustomCategoryName('');
      
      toast({
        title: 'Catégorie créée',
        description: `La catégorie "${customCategoryName}" a été créée avec succès.`,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la catégorie. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = () => {
    setUploadProgress(0);
    onSubmit({ ...uploadData, uploadType, videoSource }, videoFile, thumbnailFile);

    if (!isUploading) {
      resetForm();
    }
  };

  const resetForm = () => {
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
    setVideoSource(null);
    setUploadProgress(0);
    setShowCustomCategory(false);
    setCustomCategoryName('');
  };

  const handleClose = () => {
    if (isUploading) {
      toast({
        title: 'Cancel upload?',
        description: 'Are you sure you want to cancel this upload?',
        action: (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onClose();
              resetForm();
              toast({
                title: 'Upload cancelled',
                description: 'Your video upload has been cancelled.',
              });
            }}
          >
            Yes, cancel
          </Button>
        ),
      });
      return;
    }
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Upload New Video</DialogTitle>
          <DialogDescription>
            Add a new video to your portfolio. Fill out the details below.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <div className="grid gap-4 py-4">
            {/* Titre */}
            <div className="grid gap-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                placeholder="Enter a title for your video"
                disabled={isUploading}
              />
            </div>

            {/* Catégorie */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              {!showCustomCategory ? (
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) =>
                      setUploadData((prev) => ({ ...prev, categoryId: value }))
                    }
                    value={uploadData.categoryId}
                    disabled={isUploading}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="1">Animation</SelectItem>
                          <SelectItem value="2">Commercial</SelectItem>
                          <SelectItem value="3">Documentary</SelectItem>
                          <SelectItem value="4">Music Video</SelectItem>
                          <SelectItem value="5">Short Film</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCustomCategory(true)}
                    disabled={isUploading}
                    title="Créer une nouvelle catégorie"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nom de la nouvelle catégorie"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      disabled={isCreatingCategory}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateCustomCategory}
                      disabled={isCreatingCategory || !customCategoryName.trim()}
                      size="sm"
                    >
                      {isCreatingCategory ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Créer'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setCustomCategoryName('');
                      }}
                      disabled={isCreatingCategory}
                      size="sm"
                    >
                      Annuler
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Créez une nouvelle catégorie personnalisée pour votre vidéo.
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                placeholder="Describe your video"
                rows={3}
                disabled={isUploading}
              />
            </div>

            {/* Choix du type d'upload (lien ou fichier) */}
            <div className="grid gap-2">
              <Label>Video Source</Label>
              <div className="flex gap-4 mt-1">
                <Button
                  type="button"
                  variant={uploadType === 'link' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setUploadType('link');
                    setVideoSource(null);
                  }}
                  disabled={isUploading}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Video Link
                </Button>
                <Button
                  type="button"
                  variant={uploadType === 'file' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    setUploadType('file');
                    setVideoSource(null);
                  }}
                  disabled={isUploading}
                >
                  <FileVideo className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>

            {/* Si on a choisi "lien" */}
            {uploadType === 'link' && (
              <>
                <div className="grid gap-2">
                  <Label>Select Platform</Label>
                  <RadioGroup
                    value={videoSource || ''}
                    onValueChange={(value) =>
                      setVideoSource(value as 'youtube' | 'vimeo' | 'other' | null)
                    }
                    className="grid grid-cols-3 gap-4"
                  >
                    {/* YouTube */}
                    <div>
                      <RadioGroupItem value="youtube" id="youtube" className="peer sr-only" />
                      <Label
                        htmlFor="youtube"
                        className={cn(
                          'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer',
                          videoSource === 'youtube' ? 'border-primary' : ''
                        )}
                      >
                        <Youtube className="mb-2 h-6 w-6 text-red-600" />
                        <span className="text-sm font-medium">YouTube</span>
                      </Label>
                    </div>

                    {/* Vimeo */}
                    <div>
                      <RadioGroupItem value="vimeo" id="vimeo" className="peer sr-only" />
                      <Label
                        htmlFor="vimeo"
                        className={cn(
                          'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer',
                          videoSource === 'vimeo' ? 'border-primary' : ''
                        )}
                      >
                        <Video className="mb-2 h-6 w-6 text-blue-600" />
                        <span className="text-sm font-medium">Vimeo</span>
                      </Label>
                    </div>

                    {/* Autre */}
                    <div>
                      <RadioGroupItem value="other" id="other" className="peer sr-only" />
                      <Label
                        htmlFor="other"
                        className={cn(
                          'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer',
                          videoSource === 'other' ? 'border-primary' : ''
                        )}
                      >
                        <LinkIcon className="mb-2 h-6 w-6 text-gray-600" />
                        <span className="text-sm font-medium">Other</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* URL YouTube */}
                {videoSource === 'youtube' && (
                  <div className="grid gap-2 bg-muted/30 p-4 rounded-md border">
                    <div className="flex items-start gap-3">
                      <Youtube className="h-6 w-6 text-red-600 mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">YouTube Video</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Cliquez sur le bouton "Partager" sous la vidéo, puis copiez l'URL. Vous
                          pouvez aussi récupérer le code d'intégration (embed).
                        </p>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://youtu.be/XXXXXXXXXXX
                        </div>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://www.youtube.com/watch?v=XXXXXXXXXXX
                        </div>
                      </div>
                    </div>
                    <Label htmlFor="youtube-url">Enter YouTube URL</Label>
                    <Input
                      id="youtube-url"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="https://youtu.be/XXXXXXXXXXX"
                      disabled={isUploading}
                    />
                  </div>
                )}

                {/* Embed Vimeo */}
                {videoSource === 'vimeo' && (
                  <div className="grid gap-2 bg-muted/30 p-4 rounded-md border">
                    <div className="flex items-start gap-3">
                      <Video className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">Vimeo Video</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cliquez sur le bouton "Share", allez dans l'onglet "Embed", et copiez tout
                          le code d'intégration.
                          <span className="block mt-1 text-muted-foreground font-medium">
                            Assurez-vous que votre vidéo est en « unlisted » ou « public » pour
                            qu'elle soit visible.
                          </span>
                        </p>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono overflow-hidden">
                          &lt;div style="padding:56.25% 0 0 0;position:relative;"&gt;&lt;iframe
                          src="https://player.vimeo.com/video/..."&gt;&lt;/iframe&gt;&lt;/div&gt;
                        </div>
                      </div>
                    </div>
                    <Label htmlFor="vimeo-embed">Enter Vimeo Embed Code</Label>
                    <Textarea
                      id="vimeo-embed"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="<div style='padding:56.25% 0 0 0;position:relative;'><iframe src='https://player.vimeo.com/video/...'></iframe></div>"
                      rows={3}
                      disabled={isUploading}
                    />
                  </div>
                )}

                {/* Autre plateforme */}
                {videoSource === 'other' && (
                  <div className="grid gap-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input
                      id="videoUrl"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="Enter video URL or embed code"
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports direct video URLs or embed codes from other video hosting platforms
                    </p>
                  </div>
                )}

                {!videoSource && (
                  <div className="bg-muted/30 p-4 rounded-md text-center border">
                    <p className="text-muted-foreground">Please select a video platform</p>
                  </div>
                )}
              </>
            )}

            {/* Si on a choisi "fichier" */}
            {uploadType === 'file' && (
              <div className="grid gap-2">
                <Label htmlFor="videoFile">Video File</Label>
                <div className="border-2 border-dashed border-input rounded-md p-6 flex flex-col items-center justify-center">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-10 w-10 text-primary mb-2 animate-spin" />
                      <p className="text-sm font-medium mb-1">
                        Uploading {videoFile?.name}
                      </p>
                      <div className="w-full max-w-xs mt-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {uploadProgress}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
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
                        onChange={handleVideoFileChange}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => document.getElementById('videoFile')?.click()}
                        disabled={isUploading}
                      >
                        Select File
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail */}
            <div className="grid gap-2">
              <Label>Thumbnail</Label>
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your own thumbnail (max 1MB):
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-input rounded-md p-3 flex flex-col items-center justify-center">
                        {isUploading && thumbnailFile ? (
                          <Loader2 className="h-5 w-5 text-primary mb-1 animate-spin" />
                        ) : (
                          <Image className="h-5 w-5 text-muted-foreground mb-1" />
                        )}
                        <p className="text-xs text-muted-foreground">
                          {thumbnailFile ? thumbnailFile.name : 'Click to upload'}
                        </p>
                        <Input
                          id="thumbnailFile"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleThumbnailFileChange}
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('thumbnailFile')?.click()}
                      disabled={isUploading}
                    >
                      Select Image
                    </Button>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Or select from our collection:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {predefinedThumbnails.map((thumbnail, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer border-2 rounded-md overflow-hidden transition-all ${
                          uploadData.thumbnailUrl === thumbnail
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-transparent hover:border-muted'
                        }`}
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
              </div>

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

        {/* Barre de progression si c'est en cours d'upload */}
        {isUploading && (
          <div className="my-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading...</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Cancel upload</span>
              </Button>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{uploadProgress}% complete</p>
          </div>
        )}

        {/* Footer : boutons Cancel / Upload */}
        <DialogFooter className="px-6 py-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={
              isUploading ||
              !uploadData.title ||
              (uploadType === 'link' && (!uploadData.videoUrl || !videoSource)) ||
              (uploadType === 'file' && !videoFile) ||
              !uploadType ||
              (!uploadData.thumbnailUrl && !thumbnailFile)
            }
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
