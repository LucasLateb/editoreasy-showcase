
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FunctionsHttpError } from '@supabase/functions-js';
import type { Session } from '@supabase/supabase-js';

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
  const { toast } = useToast();

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
    const handleAuthEvent = async (session: Session | null) => {
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;
      // Check if we are in a password recovery flow.
      // This usually means being on the /reset-password page with a #type=recovery in the URL.
      const isPasswordResetFlow = currentPath === '/reset-password' && currentHash.includes('type=recovery');

      if (isPasswordResetFlow) {
        // If we are in a password reset flow, we generally don't want to show an active user session.
        // The user might be technically logged in, but the UI should reflect the reset process.
        console.log("AuthContext: Password reset flow detected. Setting currentUser to null and loading to false.");
        setCurrentUser(null);
        setLoading(false);
        return; // Explicitly stop further processing for this event in this specific case.
      }

      if (session) {
        console.log("AuthContext: Session found, fetching user profile for", session.user.id);
        const userProfile = await fetchUserProfile(session.user.id);
        if (userProfile) {
          console.log("AuthContext: User profile fetched:", userProfile.name);
        } else {
          console.warn("AuthContext: User profile not found for session user:", session.user.id);
        }
        setCurrentUser(userProfile);
      } else {
        console.log("AuthContext: No session found, setting currentUser to null.");
        setCurrentUser(null);
      }
      setLoading(false);
    };

    // Listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthContext: onAuthStateChange triggered. Event:", event, "Session:", !!session);
      setLoading(true); // Set loading true immediately when an auth event occurs
      // Defer handling the event slightly. This can help prevent race conditions
      // during initial app load or fast redirects.
      setTimeout(() => handleAuthEvent(session), 0);
    });

    // Initial session check on application mount
    const checkCurrentSession = async () => {
      console.log("AuthContext: Performing initial session check (checkCurrentSession).");
      setLoading(true); // Set loading true before checking session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("AuthContext: Initial getSession result. Session:", !!session);
        // Defer handling the session status slightly.
        setTimeout(() => handleAuthEvent(session), 0);
      } catch (error) {
        console.error("AuthContext: Error during initial getSession:", error);
        // Ensure state is cleaned up on error
        setCurrentUser(null);
        setLoading(false);
      }
    };

    checkCurrentSession();

    // Cleanup function for the effect
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
        console.log("AuthContext: Unsubscribed from onAuthStateChange listener.");
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleans up on unmount

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
    refreshCurrentUserSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
