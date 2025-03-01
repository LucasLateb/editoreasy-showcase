
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

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

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function (in a real app, this would call an API)
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      // This is just a mock implementation - would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data for demo
      const user: User = {
        id: '123',
        name: 'Demo User',
        email: email,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        bio: 'Video editor with 5+ years of experience.',
        subscriptionTier: 'free',
        likes: 0,
        createdAt: new Date()
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      // This is just a mock implementation - would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data for demo
      const user: User = {
        id: '123',
        name: name,
        email: email,
        subscriptionTier: 'free',
        likes: 0,
        createdAt: new Date()
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
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
