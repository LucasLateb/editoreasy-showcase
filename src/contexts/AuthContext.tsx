import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  fetchAndUpdateUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Utility function to clean up auth state from localStorage and sessionStorage
const cleanupAuthState = () => {
  console.log("Cleaning up auth state from localStorage and sessionStorage...");
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token'); 

  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) { 
      localStorage.removeItem(key);
      console.log(`Removed ${key} from localStorage`);
    }
  });

  // Remove all Supabase auth keys from sessionStorage
  Object.keys(sessionStorage || {}).forEach((key) => { // Check if sessionStorage exists for SSR environments
    if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
      sessionStorage.removeItem(key);
      console.log(`Removed ${key} from sessionStorage`);
    }
  });
  console.log("Auth state cleanup finished.");
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const isPasswordResetFlow = window.location.pathname === '/reset-password' && 
                               window.location.hash.includes('type=recovery');

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session present" : "No session");
      if (session) {
        if (isPasswordResetFlow) {
          console.log("Password reset flow detected, clearing user and stopping load.");
          setCurrentUser(null);
          setLoading(false);
          return;
        }

        console.log("Fetching profile for user ID:", session.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile on auth change:', error.message);
          setCurrentUser(null); 
        } else if (data) {
          console.log("Profile data fetched on auth change:", data);
          const user: User = {
            id: data.id,
            name: data.name,
            email: session.user.email || data.email, // Prefer session email, fallback to profile
            avatarUrl: data.avatar_url,
            bio: data.bio,
            subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
            likes: data.likes,
            createdAt: new Date(data.created_at),
            role: data.role || 'monteur'
          };
          setCurrentUser(user);
        } else {
           console.log("No profile data found on auth change, though session exists.");
           setCurrentUser(null);
        }
      } else {
        console.log("No session, clearing user.");
        setCurrentUser(null);
      }
      setLoading(false);
    });

    const checkSession = async () => {
      console.log("Checking session on mount...");
      if (isPasswordResetFlow) {
        console.log("Password reset flow detected on mount, skipping session check.");
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error getting session on mount:", sessionError.message);
          cleanupAuthState(); 
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        console.log("Session on mount:", session ? "Session present" : "No session");
        if (session) {
          console.log("Fetching profile on mount for user ID:", session.user.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile on session check:', error.message);
            setCurrentUser(null);
          } else if (data) {
            console.log("Profile data fetched on mount:", data);
            const user: User = {
              id: data.id,
              name: data.name,
              email: session.user.email || data.email, // Prefer session email
              avatarUrl: data.avatar_url,
              bio: data.bio,
              subscriptionTier: (data.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
              likes: data.likes,
              createdAt: new Date(data.created_at),
              role: data.role || 'monteur'
            };
            setCurrentUser(user);
          } else {
            console.log("No profile data found on mount, though session exists.");
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null); 
        }
      } catch (e: any) {
        console.error("Unexpected error during session check:", e.message);
        cleanupAuthState(); 
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log("Global sign out successful before login attempt.");
      } catch (signOutError: any) {
        console.warn("Error during global sign out before login (continuing):", signOutError.message);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase login error:', error.message);
        throw error;
      }

      if (!data.user) {
        console.error('No user data returned from signInWithPassword');
        throw new Error('Login failed: No user data returned.');
      }
      
      console.log("Supabase login successful, user ID:", data.user.id);
      // At this point, onAuthStateChange should trigger and fetch the profile.
      // We will redirect and let onAuthStateChange handle setCurrentUser.
      
      // To ensure the app reacts correctly, we might need to wait for currentUser to be set
      // or simply rely on onAuthStateChange and redirect.
      // Forcing a hard redirect ensures the whole app re-initializes with the new auth state.
      window.location.href = '/dashboard'; 
      
      // The function expects a User to be returned. This part might be tricky
      // if the redirect happens before profile is fetched and user object is constructed here.
      // However, onAuthStateChange is the primary mechanism for setting currentUser.
      // For now, let's construct a temporary user object to satisfy the return type,
      // knowing the app will reload and get the full user from onAuthStateChange.
      const tempUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: '', // Name will be filled by onAuthStateChange after profile fetch
        role: 'monteur', // Default, will be updated
        subscriptionTier: 'free',
        likes: 0,
        createdAt: new Date()
      };
      return tempUser; 
    } catch (error: any) {
      console.error('Login process error:', error.message);
      setCurrentUser(null); 
      toast({ title: "Login Failed", description: error.message || "An unknown error occurred.", variant: "destructive"});
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'monteur'): Promise<User> => {
    setLoading(true);
    console.log("Attempting registration for:", email, "with role:", role);

    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log("Global sign out successful before registration attempt.");
      } catch (signOutError: any) {
        console.warn("Error during global sign out before registration (continuing):", signOutError.message);
      }

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
        console.error('Supabase registration error:', error.message);
        throw error;
      }

      // If email confirmation is enabled, data.user might exist but data.session will be null.
      if (data.session === null) { 
        console.log('Registration pending email confirmation for:', email);
        toast({
          title: "Registration Almost Complete!",
          description: "Please check your email to confirm your account.",
        });
        // Return a temporary user object, as the user is not yet fully authenticated.
        const tempUser: User = {
          id: data.user?.id || '', 
          name: name,
          email: email,
          subscriptionTier: 'free' as const,
          likes: 0,
          createdAt: new Date(),
          role: role
        };
        // Don't redirect yet, user needs to confirm email.
        // setCurrentUser(null) because no active session.
        setCurrentUser(null);
        return tempUser; 
      }
      
      // If email confirmation is disabled or user is auto-confirmed (session exists)
      console.log("Supabase registration successful, user ID:", data.user?.id);
      // onAuthStateChange will be triggered by the new session and will handle profile fetching.
      // Redirect to dashboard.
      window.location.href = '/dashboard';

      const registeredUser: User = {
        id: data.user!.id,
        name: name, // Initial name, profile trigger will set it definitively
        email: data.user!.email!,
        avatarUrl: undefined, // Will be set by profile
        bio: undefined,
        subscriptionTier: 'free',
        likes: 0,
        createdAt: new Date(data.user!.created_at!),
        role: role, // Initial role
      };
      return registeredUser; // This might not be fully utilized due to redirect.

    } catch (error: any) {
      console.error('Registration process error:', error.message);
      setCurrentUser(null);
      toast({ title: "Registration Failed", description: error.message || "An unknown error occurred.", variant: "destructive"});
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log("Attempting logout...");
    setLoading(true);
    try {
      cleanupAuthState(); 
      const { error } = await supabase.auth.signOut({ scope: 'global' }); 

      if (error) {
        console.error('Supabase signOut error:', error.message);
        toast({
          title: "Logout Error",
          description: `Supabase signout failed: ${error.message}. Local session cleared.`,
          variant: "destructive"
        });
      } else {
        console.log("Supabase signOut successful.");
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    } catch (error: any) {
      console.error('Logout process error:', error.message);
      toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred during logout.",
        variant: "destructive"
      });
    } finally {
      // setCurrentUser(null) will be handled by onAuthStateChange after signOut
      // Force a redirect to a public page to ensure clean state
      window.location.href = '/login'; 
      setLoading(false); // May not be reached if redirect is too fast
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!currentUser) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      throw new Error('User not authenticated');
    }
    console.log("Updating avatar for user:", currentUser.id, "to URL:", avatarUrl);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating avatar in Supabase:', error.message);
        throw error;
      }

      setCurrentUser(prev => prev ? {...prev, avatarUrl} : null);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating avatar:', error.message);
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating your avatar.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const fetchAndUpdateUser = async (userId: string): Promise<void> => {
    if (!userId) {
      console.warn('fetchAndUpdateUser called without userId');
      return;
    }
    console.log("Fetching and updating user data for ID:", userId);
    // setLoading(true); // Consider if this global loading is desired here
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile for update:', profileError.message);
        // Do not clear currentUser here, to avoid logging out if profile fetch fails temporarily
        return; 
      }

      if (profileData) {
        console.log("Profile data fetched for update:", profileData);
        const user: User = {
          id: profileData.id,
          name: profileData.name,
          // Assuming email comes from auth session primarily, but profile might have it too
          email: currentUser?.email || profileData.email, 
          avatarUrl: profileData.avatar_url,
          bio: profileData.bio,
          subscriptionTier: (profileData.subscription_tier || 'free') as 'free' | 'premium' | 'pro',
          likes: profileData.likes,
          createdAt: new Date(profileData.created_at),
          role: profileData.role || 'monteur'
        };
        setCurrentUser(user);
        console.log("Current user updated with fetched data.");
      } else {
        console.warn(`Profile not found for user ID during update: ${userId}. Current user might be stale or logged out.`);
        // setCurrentUser(null); // Or, keep existing user? If profile vanishes, user should likely be logged out.
      }
    } catch (error: any) {
      console.error('Failed to fetch and update user:', error.message);
    } finally {
      // setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser && !loading, // Consider loading state for isAuthenticated
    updateAvatar,
    fetchAndUpdateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
