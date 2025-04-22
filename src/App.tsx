import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Pricing from '@/pages/Pricing';
import Explore from '@/pages/Explore';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import CheckEmail from '@/pages/CheckEmail';
import { supabase } from '@/integrations/supabase/client';

const queryClient = new QueryClient();

// This component checks for the auth recovery token in the URL
// and redirects to reset password page when present
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a type=recovery token in the URL
    const checkRecoveryToken = async () => {
      const hasRecoveryToken = location.hash.includes('type=recovery');
      
      if (hasRecoveryToken) {
        // Extract the access token from the URL
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          // If we have a recovery token, redirect to reset password page
          navigate('/reset-password');
        }
      }
    };

    checkRecoveryToken();
  }, [location, navigate]);

  return null;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AuthRedirectHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/editor/:id" element={<Portfolio isViewOnly />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
