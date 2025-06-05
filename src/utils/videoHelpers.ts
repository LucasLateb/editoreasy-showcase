
// Helper functions to detect video platform types
export const isTikTokEmbed = (url: string): boolean => {
  return url.includes('tiktok-embed') || url.includes('tiktok.com');
};

export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^&\n?#]+)/ // YouTube Shorts pattern
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isYouTubeShorts = (url: string): boolean => {
  return url.includes('/shorts/');
};

export const isVimeoUrl = (url: string): boolean => {
  return url.includes('vimeo.com');
};

export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com');
};

export const getVideoAspectRatio = (videoUrl: string): 'vertical' | 'horizontal' => {
  if (isTikTokEmbed(videoUrl) || isYouTubeShorts(videoUrl)) {
    return 'vertical';
  }
  return 'horizontal';
};

// Additional helper functions for compatibility
export const isYouTubeVideo = (url: string): boolean => {
  return !!getYouTubeVideoId(url);
};

export const isTikTokVideo = (url: string): boolean => {
  return isTikTokEmbed(url);
};

export const extractYouTubeVideoId = (url: string): string | null => {
  return getYouTubeVideoId(url);
};
