
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast'; // shadcn toast for internal context messages
import { FunctionsHttpError } from '@supabase/functions-js'; // Importer FunctionsHttpError

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  refreshCurrentUserSubscription: () => Promise<void>; // Nouvelle fonction
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
  const { toast } = useToast(); // shadcn toast

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    if (data) {
      return {
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
    }
    return null;
  };

  useEffect(() => {
    // Check if we're on a password reset page with recovery token
    const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                               window.location.hash.includes('type=recovery');

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                                 window.location.hash.includes('type=recovery');
      if (session) {
        if (isPasswordResetFlow) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        const userProfile = await fetchUserProfile(session.user.id);
        setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Check current session on mount
    const checkSession = async () => {
      setLoading(true);
      const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                                 window.location.hash.includes('type=recovery');
      if (isPasswordResetFlow) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userProfile = await fetchUserProfile(session.user.id);
        setCurrentUser(userProfile);
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
      if (!data.user) throw new Error("Login failed, no user data returned.");

      const userProfile = await fetchUserProfile(data.user.id);
      if (!userProfile) throw new Error("Failed to fetch profile after login.");
      
      setCurrentUser(userProfile);
      return userProfile;
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
      
      // The trigger handle_new_user should create the profile. Let's try to fetch it.
      // Add a small delay to allow the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      const userProfile = await fetchUserProfile(data.user.id);

      if (userProfile) {
        setCurrentUser(userProfile);
        return userProfile;
      } else {
        // Fallback if profile not found immediately (e.g. trigger delay)
        console.warn("Profile not immediately found after registration, creating temporary user object.");
        const tempUser: User = {
          id: data.user.id,
          name: name,
          email: email,
          subscriptionTier: 'free' as const,
          likes: 0,
          createdAt: new Date(),
          role: role
        };
        setCurrentUser(tempUser);
        return tempUser;
      }
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

  const refreshCurrentUserSubscription = async () => {
    if (!currentUser) {
      console.warn("refreshCurrentUserSubscription called without a current user.");
      return;
    }
    setLoading(true);
    try {
      // Call check-subscription to ensure Stripe data is synced to our DB
      const { error: functionError } = await supabase.functions.invoke('check-subscription');
      if (functionError) {
        throw functionError;
      }

      // Re-fetch the user profile from our database as check-subscription updates it
      const updatedProfile = await fetchUserProfile(currentUser.id);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
        toast({
          title: "Subscription Updated",
          description: "Your subscription details have been refreshed.",
        });
      } else {
        console.error("Failed to fetch profile after subscription refresh.");
        // This case means fetchUserProfile returned null, but check-subscription might have succeeded.
        // We'll throw an error to trigger the more generic failure toast for now.
        throw new Error("Profile fetch failed after subscription check.");
      }
    } catch (error: any) {
      console.error('Error refreshing user subscription:', error);
      let errorMessage = "Could not update your subscription details. Please try refreshing the page.";
      if (error instanceof FunctionsHttpError) {
        console.error('FunctionsHttpError context:', error.context);
        const specificMessage = typeof error.context?.error === 'string' ? error.context.error : error.message;
        errorMessage = `Details: ${specificMessage}. Please try refreshing the page.`;
      } else if (error.message) {
        errorMessage = `${error.message} Please try refreshing the page.`;
      }
      
      toast({
        title: "Subscription Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    updateAvatar,
    refreshCurrentUserSubscription, // Exposer la nouvelle fonction
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

