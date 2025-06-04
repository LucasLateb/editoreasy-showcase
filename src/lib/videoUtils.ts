
// Utility functions for handling video URLs from different platforms

export const getEmbedUrl = (url: string, platform?: string): string => {
  if (!url) return '';

  // If it's already an embed code (contains iframe), return as is
  if (url.includes('<iframe')) {
    return url;
  }

  // YouTube URL handling
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  // Google Drive URL handling
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // For Vimeo embeds and other iframe codes, return as is
  if (url.includes('vimeo.com') || url.includes('<iframe')) {
    return url;
  }

  // For direct video URLs, return as is
  return url;
};

export const isEmbedCode = (url: string): boolean => {
  return url.includes('<iframe') || url.includes('<div');
};

export const extractVideoId = (url: string, platform: string): string | null => {
  switch (platform) {
    case 'youtube':
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/watch?v=')) {
        return url.split('v=')[1].split('&')[0];
      }
      break;
    
    case 'googledrive':
      const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      return fileIdMatch ? fileIdMatch[1] : null;
    
    case 'vimeo':
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      return vimeoMatch ? vimeoMatch[1] : null;
  }
  
  return null;
};

export const getPlatformFromUrl = (url: string): string | null => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('drive.google.com')) {
    return 'googledrive';
  }
  
  if (url.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  return null;
};
