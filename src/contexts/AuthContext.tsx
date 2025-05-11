
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're on a password reset page with recovery token
    const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                               window.location.hash.includes('type=recovery');

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Skip profile fetch if we're in password reset flow
        if (isPasswordResetFlow) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        // Fetch the user profile from our profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
        } else if (data) {
          // Convert data to match our User type
          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatar_url,
            bio: data.bio,
            subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
            likes: data.likes,
            createdAt: new Date(data.created_at),
            role: data.role || 'monteur'
          };
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Check current session on mount
    const checkSession = async () => {
      // Skip session check if we're in password reset flow
      if (isPasswordResetFlow) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch the user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          // Convert data to match our User type
          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatar_url,
            bio: data.bio,
            subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
            likes: data.likes,
            createdAt: new Date(data.created_at),
            role: data.role || 'monteur'
          };
          setCurrentUser(user);
        }
      }
      setLoading(false);
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Convert to our User type
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        avatarUrl: profileData.avatar_url,
        bio: profileData.bio,
        subscriptionTier: (profileData.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
        likes: profileData.likes,
        createdAt: new Date(profileData.created_at),
        role: profileData.role || 'monteur'
      };

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'monteur'): Promise<User> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from signUp');
      }

      // At this point the user has been created and our trigger should have created a profile
      // Let's fetch it to confirm
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // If we can't find the profile, it might be because the trigger hasn't run yet
        // Let's create a temporary user object from what we know
        const user: User = {
          id: data.user.id,
          name: name,
          email: email,
          subscriptionTier: 'free' as const,
          likes: 0,
          createdAt: new Date(),
          role: role
        };
        
        setCurrentUser(user);
        return user;
      }

      // Convert to our User type
      const user: User = {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        avatarUrl: profileData.avatar_url,
        bio: profileData.bio,
        subscriptionTier: (profileData.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
        likes: profileData.likes,
        createdAt: new Date(profileData.created_at),
        role: profileData.role || role
      };
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }

      // Update the current user state
      setCurrentUser(prev => prev ? {...prev, avatarUrl} : null);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your avatar.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    updateAvatar
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
