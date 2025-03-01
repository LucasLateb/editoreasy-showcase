
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
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
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
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
            subscriptionTier: data.subscription_tier,
            likes: data.likes,
            createdAt: new Date(data.created_at)
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
            subscriptionTier: data.subscription_tier,
            likes: data.likes,
            createdAt: new Date(data.created_at)
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
        subscriptionTier: profileData.subscription_tier,
        likes: profileData.likes,
        createdAt: new Date(profileData.created_at)
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

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name // This will be stored in user metadata and used by our trigger
          }
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
          subscriptionTier: 'free',
          likes: 0,
          createdAt: new Date()
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
        subscriptionTier: profileData.subscription_tier,
        likes: profileData.likes,
        createdAt: new Date(profileData.created_at)
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

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
