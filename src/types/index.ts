export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  subscriptionTier: 'free' | 'premium' | 'pro';
  likes: number;
  createdAt: Date;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  categoryId: string;
  userId: string;
  likes: number;
  views: number;
  createdAt: Date;
  isHighlighted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

export interface SubscriptionPlan {
  id: 'free' | 'premium' | 'pro';
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface PortfolioSettings {
  id: string;
  user_id: string;
  categories: Category[];
  featured_video: Video;
  highlighted_videos: Video[];
  about?: string;
  specializations?: string[];
  created_at?: string;
  updated_at?: string;
}

export function parseJsonToCategory(json: any): Category {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON for Category');
  }
  
  return {
    id: String(json.id || ''),
    name: String(json.name || ''),
    description: String(json.description || ''),
    thumbnailUrl: String(json.thumbnailUrl || '')
  };
}

export function parseJsonToVideo(json: any): Video {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid JSON for Video');
  }
  
  return {
    id: String(json.id || ''),
    title: String(json.title || ''),
    description: String(json.description || ''),
    thumbnailUrl: String(json.thumbnailUrl || ''),
    videoUrl: String(json.videoUrl || ''),
    categoryId: String(json.categoryId || ''),
    userId: String(json.userId || ''),
    likes: Number(json.likes || 0),
    views: Number(json.views || 0),
    createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
    isHighlighted: Boolean(json.isHighlighted)
  };
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Vertical Format',
    description: 'Short-form vertical videos optimized for mobile viewing.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  },
  {
    id: '2',
    name: 'Cinematic',
    description: 'Professional high-quality videos with cinematic aesthetics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  },
  {
    id: '3', 
    name: 'Vlog',
    description: 'Personal video blogs featuring day-to-day activities.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  },
  {
    id: '4',
    name: 'Dynamic',
    description: 'Fast-paced videos with energetic transitions and effects.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
  },
  {
    id: '5',
    name: 'Animation',
    description: 'Creative animated videos and motion graphics.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
  },
  {
    id: '6',
    name: 'Documentary',
    description: 'Informative and educational video content.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521',
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for beginners',
    price: 0,
    features: [
      'Upload up to 5 videos',
      'Basic portfolio page',
      'Community access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For serious creators',
    price: 9.99,
    popular: true,
    features: [
      'Upload up to 30 videos',
      'Custom portfolio page',
      'Category organization',
      'Analytics dashboard',
      'Priority support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional editors',
    price: 19.99,
    features: [
      'Unlimited video uploads',
      'Advanced customization',
      'Client collaboration tools',
      'Detailed analytics',
      'Custom domain',
      'Premium support',
      'Featured on homepage'
    ]
  }
];

export const popularEditors: User[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    bio: 'Award-winning video editor specializing in cinematic films.',
    subscriptionTier: 'pro',
    likes: 532,
    createdAt: new Date('2021-05-12')
  },
  {
    id: '2',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
    bio: 'Creating dynamic visual content for leading brands.',
    subscriptionTier: 'premium',
    likes: 423,
    createdAt: new Date('2021-06-18')
  },
  {
    id: '3',
    name: 'Taylor Swift',
    email: 'taylor@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    bio: 'Specializing in animation and motion graphics.',
    subscriptionTier: 'pro',
    likes: 387,
    createdAt: new Date('2021-04-25')
  },
  {
    id: '4',
    name: 'Sam Wilson',
    email: 'sam@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    bio: 'Vertical video expert for social media platforms.',
    subscriptionTier: 'premium',
    likes: 289,
    createdAt: new Date('2021-07-30')
  }
];
