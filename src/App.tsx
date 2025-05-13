import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/Toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import CheckEmail from '@/pages/CheckEmail';

// Optimize lazy loading by using dynamic imports with prefetch
const Index = lazy(() => import('@/pages/Index'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Explore = lazy(() => import('@/pages/Explore'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));

// Optimize query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000, // Increased to 1 minute for better caching
      refetchOnWindowFocus: false,
      refetchOnReconnect: false, // Disable refetching on reconnect
      cacheTime: 5 * 60 * 1000, // 5 minutes cache time
    },
  },
});

// This component checks for the auth recovery token in the URL
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectChecked, setRedirectChecked] = useState(false);

  useEffect(() => {
    if (redirectChecked) return;

    const checkRecoveryToken = () => {
      try {
        const hasRecoveryToken = location.hash.includes('type=recovery');
        
        if (hasRecoveryToken) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            navigate('/reset-password');
          }
        }
        
        setRedirectChecked(true);
      } catch (error) {
        console.error('Error checking recovery token:', error);
        setRedirectChecked(true);
      }
    };

    // Use a small timeout to ensure the browser has fully initialized
    const timer = setTimeout(checkRecoveryToken, 100);
    
    return () => clearTimeout(timer);
  }, [location, navigate, redirectChecked]);

  return null;
};

// Optimized loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AuthRedirectHandler />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/editor/:id" element={<Portfolio isViewOnly />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
