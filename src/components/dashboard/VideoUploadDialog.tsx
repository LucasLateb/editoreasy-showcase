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
import CategorySearch from '@/components/CategorySearch';

import { useCategories } from '@/hooks/useCategories';
import { UploadCloud, LinkIcon, FileVideo, Image, Youtube, Video, Loader2, X, HardDrive, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UploadFormData, videoFile: File | null, thumbnailFile: File | null) => void;
  isUploading: boolean;
}

export interface UploadFormData {
  title: string;
  description: string;
  videoUrl: string;
  categoryId: string;
  thumbnailUrl: string;
  uploadType?: 'link' | 'file' | null;
  videoSource?: 'youtube' | 'vimeo' | 'googledrive' | 'tiktok' | null;
}

const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isUploading
}) => {
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Les données de base pour l'upload
  const [uploadData, setUploadData] = useState<UploadFormData>({
    title: '',
    description: '',
    videoUrl: '',
    categoryId: '', // S'assurer que c'est bien initialisé
    thumbnailUrl: '',
  });

  const [uploadType, setUploadType] = useState<'link' | 'file' | null>(null);
  const [videoSource, setVideoSource] = useState<'youtube' | 'vimeo' | 'googledrive' | 'tiktok' | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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

  const handleSubmit = () => {
    // Validation avant soumission
    if (!uploadData.categoryId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une catégorie.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Submitting video with category:', uploadData.categoryId);
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
      categoryId: '',
      thumbnailUrl: '',
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setUploadType(null);
    setVideoSource(null);
    setUploadProgress(0);
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

  // Fonction pour gérer la sélection de catégorie
  const handleCategorySelect = (categoryId: string) => {
    console.log('Category selected:', categoryId);
    setUploadData(prev => ({ ...prev, categoryId }));
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
            {/* Title */}
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

            {/* Category with search */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading categories...</span>
                </div>
              ) : (
                <CategorySearch
                  categories={categories}
                  selectedCategoryId={uploadData.categoryId}
                  onCategorySelect={handleCategorySelect}
                  placeholder="Search and select a category..."
                  disabled={isUploading}
                />
              )}
              {uploadData.categoryId && (
                <p className="text-xs text-muted-foreground">
                  Selected: {categories.find(c => c.id === uploadData.categoryId)?.name || 'Unknown'}
                </p>
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
                      setVideoSource(value as 'youtube' | 'vimeo' | 'googledrive' | 'tiktok' | null)
                    }
                    className="grid grid-cols-2 gap-4"
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

                    {/* Google Drive */}
                    <div>
                      <RadioGroupItem value="googledrive" id="googledrive" className="peer sr-only" />
                      <Label
                        htmlFor="googledrive"
                        className={cn(
                          'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer',
                          videoSource === 'googledrive' ? 'border-primary' : ''
                        )}
                      >
                        <HardDrive className="mb-2 h-6 w-6 text-green-600" />
                        <span className="text-sm font-medium">Google Drive</span>
                      </Label>
                    </div>

                    {/* TikTok */}
                    <div>
                      <RadioGroupItem value="tiktok" id="tiktok" className="peer sr-only" />
                      <Label
                        htmlFor="tiktok"
                        className={cn(
                          'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer',
                          videoSource === 'tiktok' ? 'border-primary' : ''
                        )}
                      >
                        <Play className="mb-2 h-6 w-6 text-black" />
                        <span className="text-sm font-medium">TikTok</span>
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
                        <h3 className="font-medium mb-1">YouTube Video / Shorts</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Cliquez sur le bouton "Partager" sous la vidéo, puis copiez l'URL. Fonctionne
                          avec les vidéos YouTube classiques et les Shorts.
                        </p>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://youtu.be/XXXXXXXXXXX
                        </div>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://www.youtube.com/watch?v=XXXXXXXXXXX
                        </div>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://www.youtube.com/shorts/XXXXXXXXXXX
                        </div>
                        <p className="text-xs text-amber-600 mt-2">
                          <strong>Note :</strong> Les YouTube Shorts seront automatiquement affichés en format vertical.
                        </p>
                      </div>
                    </div>
                    <Label htmlFor="youtube-url">Enter YouTube URL (Videos & Shorts)</Label>
                    <Input
                      id="youtube-url"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="https://youtu.be/XXXXXXXXXXX or https://www.youtube.com/shorts/XXXXXXXXXXX"
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

                {/* Google Drive */}
                {videoSource === 'googledrive' && (
                  <div className="grid gap-2 bg-muted/30 p-4 rounded-md border">
                    <div className="flex items-start gap-3">
                      <HardDrive className="h-6 w-6 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">Google Drive Video</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Pour intégrer une vidéo depuis Google Drive :
                        </p>
                        <ol className="text-sm text-muted-foreground mb-3 space-y-1 list-decimal list-inside">
                          <li>Ouvrez votre fichier vidéo dans Google Drive</li>
                          <li>Cliquez sur "Partager" et assurez-vous que le lien est accessible à "Tous les utilisateurs avec le lien"</li>
                          <li>Cliquez sur "Copier le lien" et collez-le ci-dessous</li>
                        </ol>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono">
                          https://drive.google.com/file/d/1XXXXXXXXXXXXX/view?usp=sharing
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Important :</strong> Assurez-vous que votre vidéo est partagée publiquement pour qu'elle puisse être lue.
                        </p>
                      </div>
                    </div>
                    <Label htmlFor="googledrive-url">Enter Google Drive Share Link</Label>
                    <Input
                      id="googledrive-url"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/1XXXXXXXXXXXXX/view?usp=sharing"
                      disabled={isUploading}
                    />
                  </div>
                )}

                {/* TikTok */}
                {videoSource === 'tiktok' && (
                  <div className="grid gap-2 bg-muted/30 p-4 rounded-md border">
                    <div className="flex items-start gap-3">
                      <Play className="h-6 w-6 text-black mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">TikTok Video</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Pour intégrer une vidéo TikTok :
                        </p>
                        <ol className="text-sm text-muted-foreground mb-3 space-y-1 list-decimal list-inside">
                          <li>Ouvrez votre vidéo TikTok</li>
                          <li>Cliquez sur "Intégrer" (Embed)</li>
                          <li>Copiez tout le code d'intégration et collez-le ci-dessous</li>
                        </ol>
                        <div className="mb-2 bg-background p-2 rounded border text-xs font-mono overflow-hidden">
                          &lt;blockquote class="tiktok-embed"&gt;&lt;a href="https://www.tiktok.com/@username/video/..."&gt;&lt;/a&gt;&lt;/blockquote&gt;&lt;script async src="https://www.tiktok.com/embed.js"&gt;&lt;/script&gt;
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Important :</strong> Assurez-vous que votre vidéo TikTok est publique pour qu'elle puisse être intégrée.
                        </p>
                      </div>
                    </div>
                    <Label htmlFor="tiktok-embed">Enter TikTok Embed Code</Label>
                    <Textarea
                      id="tiktok-embed"
                      value={uploadData.videoUrl}
                      onChange={(e) => setUploadData({ ...uploadData, videoUrl: e.target.value })}
                      placeholder="<blockquote class='tiktok-embed'><a href='https://www.tiktok.com/@username/video/...'></a></blockquote><script async src='https://www.tiktok.com/embed.js'></script>"
                      rows={3}
                      disabled={isUploading}
                    />
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
              !uploadData.categoryId ||
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
