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
    console.log('[AuthContext] Attempting to fetch subscription details (v2 - explicit POST)...');
    setLoadingSubscription(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[AuthContext] Error getting session:', sessionError);
        setSubscriptionDetails(null);
        setLoadingSubscription(false);
        toast({
          title: "Erreur de session",
          description: "Impossible de récupérer la session utilisateur.",
          variant: "destructive",
        });
        return;
      }

      if (!sessionData.session) {
        console.log('[AuthContext] No active session, cannot fetch subscription details.');
        setSubscriptionDetails(null);
        setLoadingSubscription(false);
        return;
      }
      
      console.log('[AuthContext] Session found. Invoking "check-subscription" function with explicit POST.');
      const { data: functionData, error: functionError } = await supabase.functions.invoke(
        'check-subscription',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 'apikey': supabaseAnonKey, // Supabase client adds this automatically
            // 'Authorization': `Bearer ${sessionData.session.access_token}` // Supabase client adds this automatically
          },
          body: {}, // Empty JSON body is fine; function uses token for user context
        }
      );
      
      console.log('[AuthContext] "check-subscription" invocation complete.', { 
        functionData, 
        functionError: functionError ? { 
          name: functionError.name, 
          message: functionError.message, 
          context: (functionError as any).context,
          status: (functionError as any).status // If the error object has a status
        } : null 
      });

      if (functionError) {
        console.error('[AuthContext] Error fetching subscription details from function:', functionError);
        toast({
          title: "Erreur de synchronisation",
          description: "Impossible de vérifier les détails de votre abonnement.",
          variant: "destructive",
        });
        setSubscriptionDetails(null);
      } else if (functionData) {
        console.log('[AuthContext] Subscription details received:', functionData);
        setSubscriptionDetails({
          isSubscribed: functionData.subscribed,
          tier: functionData.subscription_tier,
          status: functionData.status,
          currentPeriodEnd: functionData.current_period_end,
        });
        if (currentUser && functionData.subscription_tier && currentUser.subscriptionTier !== functionData.subscription_tier) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            if (profileError) {
                console.error('[AuthContext] Error re-fetching user profile after subscription update:', profileError);
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
                console.log('[AuthContext] Updated currentUser with new subscriptionTier from profile:', updatedUser.subscriptionTier);
            }
        }
      } else {
        console.warn('[AuthContext] "check-subscription" returned no data and no error.');
        setSubscriptionDetails(null);
      }
    } catch (e: any) {
      console.error('[AuthContext] Unexpected error in fetchSubscriptionDetails:', e);
      toast({
        title: "Erreur Inattendue",
        description: "Une erreur inattendue est survenue lors de la vérification de l'abonnement.",
        variant: "destructive",
      });
      setSubscriptionDetails(null);
    } finally {
      setLoadingSubscription(false);
      console.log('[AuthContext] Finished fetchSubscriptionDetails.');
    }
  }, [toast, currentUser]);

  useEffect(() => {
    const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                               window.location.hash.includes('type=recovery');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session ? { userId: session.user.id, event } : event);
      if (session) {
        if (isPasswordResetFlow) {
          console.log('[AuthContext] Password reset flow detected, skipping profile fetch and subscription details.');
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
          console.error('[AuthContext] Error fetching user profile on auth state change:', error);
          setCurrentUser(null); // Clear user on profile fetch error
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
          console.log('[AuthContext] User set from auth state change:', user.id);
        }
        await fetchSubscriptionDetails();
      } else {
        console.log('[AuthContext] No session from auth state change. Clearing user and subscription.');
        setCurrentUser(null);
        setSubscriptionDetails(null);
      }
      setLoading(false);
    });

    const checkSession = async () => {
      console.log('[AuthContext] Initial session check...');
      if (isPasswordResetFlow) {
        console.log('[AuthContext] Password reset flow detected during initial check, skipping profile fetch and subscription details.');
        setLoading(false);
        setLoadingSubscription(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[AuthContext] Session exists on initial check:', session.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('[AuthContext] Error fetching user profile on initial load:', error);
          // setCurrentUser(null) might be too aggressive here if profile is just temporarily unavailable
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
          console.log('[AuthContext] User set from initial session check:', user.id);
        }
        await fetchSubscriptionDetails();
      } else {
         console.log('[AuthContext] No session on initial check. Clearing subscription details.');
         setSubscriptionDetails(null);
      }
      setLoading(false);
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSubscriptionDetails]);

  const login = async (email: string, password: string): Promise<AppUserType> => {
    setLoading(true);
    console.log('[AuthContext] Attempting login for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('[AuthContext] Login error (supabase.auth.signInWithPassword):', error);
        throw error;
      }
      if (!data.user) {
         console.error('[AuthContext] Login successful but no user data returned.');
         throw new Error('Login did not return user data.');
      }

      console.log('[AuthContext] Login successful, fetching profile for user:', data.user.id);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('[AuthContext] Error fetching profile after login:', profileError);
        throw profileError;
      }
      if (!profileData) {
        console.error('[AuthContext] Profile not found for user after login:', data.user.id);
        throw new Error('Profile not found for user.');
      }

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
      console.log('[AuthContext] User set after login, fetching subscription details.');
      await fetchSubscriptionDetails();
      return user;
    } catch (error) {
      console.error('[AuthContext] Overall login process error:', error);
      setCurrentUser(null);
      setSubscriptionDetails(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'monteur'): Promise<AppUserType> => {
    setLoading(true);
    console.log('[AuthContext] Attempting registration for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('[AuthContext] Registration error (supabase.auth.signUp):', error);
        throw error;
      }
      if (!data.user) {
        console.error('[AuthContext] Registration successful but no user data returned.');
        throw new Error('Registration did not return user data.');
      }
      console.log('[AuthContext] Registration successful, user ID:', data.user.id);
      
      let userToSet: AppUserType;
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        console.warn('[AuthContext] Profile not found immediately after signup, or error fetching. Using provided data.', profileError);
        userToSet = {
          id: data.user.id,
          name: name,
          email: email,
          subscriptionTier: 'free' as const, // New users are free by default
          likes: 0,
          createdAt: new Date(data.user.created_at || Date.now()), // Use user.created_at if available
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
      console.log('[AuthContext] User registration processed. Awaiting auth state change for full user setup.');
      return userToSet;
    } catch (error) {
      console.error('[AuthContext] Overall registration process error:', error);
      setCurrentUser(null);
      setSubscriptionDetails(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logging out.');
    try {
      await supabase.auth.signOut();
      // onAuthStateChange will handle setting currentUser and subscriptionDetails to null.
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      toast({
        title: "Logout failed",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!currentUser) {
      toast({ title: "Erreur", description: "Utilisateur non authentifié.", variant: "destructive" });
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating avatar in DB:', error);
        throw error;
      }

      setCurrentUser(prev => prev ? {...prev, avatarUrl} : null);
      
      toast({
        title: "Avatar mis à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error('Error in updateAvatar function:', error);
      toast({
        title: "Échec de la mise à jour",
        description: "Une erreur s'est produite lors de la mise à jour de votre avatar.",
        variant: "destructive"
      });
      throw error;
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
    subscriptionDetails,
    loadingSubscription,
    refreshSubscriptionDetails: fetchSubscriptionDetails,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
