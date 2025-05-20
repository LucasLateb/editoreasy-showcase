import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as AppUserType } from '@/types'; // Assuming AppUserType is your base user type from src/types
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast'; // Original toast from shadcn/ui
// Note: PlanTab uses toast from 'sonner', ensure consistency or be aware of different toast systems.

// Define a type for detailed subscription information
interface SubscriptionDetails {
  isSubscribed: boolean;
  tier: string | null;
  status: string | null; // e.g., 'active', 'trialing', 'past_due', 'canceled'
  currentPeriodEnd: string | null; // ISO date string
}

interface AuthContextType {
  currentUser: AppUserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUserType>;
  register: (name: string, email: string, password: string, role?: string) => Promise<AppUserType>;
  logout: () => void;
  isAuthenticated: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  subscriptionDetails: SubscriptionDetails | null;
  loadingSubscription: boolean;
  refreshSubscriptionDetails: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<AppUserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const { toast } = useToast();

  const fetchSubscriptionDetails = useCallback(async () => {
    console.log('[AuthContext] Fetching subscription details...');
    setLoadingSubscription(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.log('[AuthContext] No session, cannot fetch subscription details.');
        setSubscriptionDetails(null);
        setLoadingSubscription(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Error fetching subscription details:', error);
        toast({
          title: "Erreur de synchronisation",
          description: "Impossible de vérifier les détails de votre abonnement.",
          variant: "destructive",
        });
        setSubscriptionDetails(null);
      } else if (data) {
        console.log('[AuthContext] Subscription details received:', data);
        setSubscriptionDetails({
          isSubscribed: data.subscribed,
          tier: data.subscription_tier,
          status: data.status,
          currentPeriodEnd: data.current_period_end,
        });
        // Optionally, refresh currentUser if subscription_tier in profiles was updated by the edge function
        // This requires re-fetching profile data
        if (currentUser && data.subscription_tier && currentUser.subscriptionTier !== data.subscription_tier) {
            // Re-fetch profile to update currentUser.subscriptionTier
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            if (profileError) {
                console.error('Error re-fetching user profile after subscription update:', profileError);
            } else if (profileData) {
                const updatedUser: AppUserType = {
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
                setCurrentUser(updatedUser);
            }
        }
      }
    } catch (e) {
      console.error('Unexpected error fetching subscription details:', e);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue lors de la vérification de l'abonnement.",
        variant: "destructive",
      });
      setSubscriptionDetails(null);
    } finally {
      setLoadingSubscription(false);
      console.log('[AuthContext] Finished fetching subscription details.');
    }
  }, [toast, currentUser]); // Added currentUser to dependency array for re-fetch logic

  useEffect(() => {
    const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                               window.location.hash.includes('type=recovery');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session);
      if (session) {
        if (isPasswordResetFlow) {
          setCurrentUser(null);
          setSubscriptionDetails(null);
          setLoading(false);
          setLoadingSubscription(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setCurrentUser(null);
        } else if (data) {
          const user: AppUserType = {
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
        // Fetch subscription details after user is set or session changes
        fetchSubscriptionDetails();

      } else {
        setCurrentUser(null);
        setSubscriptionDetails(null);
      }
      setLoading(false); // setLoadingSubscription is handled by fetchSubscriptionDetails
    });

    const checkSession = async () => {
      console.log('[AuthContext] Checking session...');
      if (isPasswordResetFlow) {
        setLoading(false);
        setLoadingSubscription(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile on initial load:', error);
        } else if (data) {
          const user: AppUserType = {
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
        // Fetch subscription details after initial session check
        await fetchSubscriptionDetails(); // ensure this completes
      } else {
         setSubscriptionDetails(null); // No session, no subscription details
      }
      setLoading(false); // setLoadingSubscription is handled by fetchSubscriptionDetails
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSubscriptionDetails]); // Added fetchSubscriptionDetails to dependency array

  const login = async (email: string, password: string): Promise<AppUserType> => {
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
      const user: AppUserType = {
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
      await fetchSubscriptionDetails(); // Fetch subscription details after login
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setCurrentUser(null); // Ensure currentUser is null on error
      setSubscriptionDetails(null); // Clear subscription details on login error
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'monteur'): Promise<AppUserType> => {
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

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let userToSet: AppUserType;

      if (profileError || !profileData) {
        console.warn('Profile not found immediately after signup, or error fetching. Using provided data.', profileError);
        userToSet = {
          id: data.user.id,
          name: name,
          email: email,
          subscriptionTier: 'free' as const,
          likes: 0,
          createdAt: new Date(),
          role: role 
        };
      } else {
        userToSet = {
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
      }
      
      setCurrentUser(userToSet);
      // New user is 'free' by default, check-subscription will confirm if anything else
      await fetchSubscriptionDetails(); 
      return userToSet;
    } catch (error) {
      console.error('Register error:', error);
      setCurrentUser(null);
      setSubscriptionDetails(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setSubscriptionDetails(null); // Clear subscription details on logout
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

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    updateAvatar,
    subscriptionDetails,
    loadingSubscription,
    refreshSubscriptionDetails: fetchSubscriptionDetails, // Expose the memoized fetch function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
