
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

// Regular imports for critical path components
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// Lazy load non-critical components
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Explore = lazy(() => import('@/pages/Explore'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const CheckEmail = lazy(() => import('@/pages/CheckEmail'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      // Add error handling to prevent app crashes from failed queries
      onError: (error) => {
        console.error('Query error:', error);
      }
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

    try {
      const hasRecoveryToken = location.hash.includes('type=recovery');
      
      if (hasRecoveryToken) {
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          navigate('/reset-password');
        }
      }
    } catch (error) {
      console.error('Error checking recovery token:', error);
    } finally {
      setRedirectChecked(true);
    }
  }, [location, navigate, redirectChecked]);

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Lazy loaded routes */}
            <Route path="/dashboard" element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/portfolio" element={
              <Suspense fallback={<LoadingFallback />}>
                <Portfolio />
              </Suspense>
            } />
            <Route path="/pricing" element={
              <Suspense fallback={<LoadingFallback />}>
                <Pricing />
              </Suspense>
            } />
            <Route path="/explore" element={
              <Suspense fallback={<LoadingFallback />}>
                <Explore />
              </Suspense>
            } />
            <Route path="/editor/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <Portfolio isViewOnly />
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<LoadingFallback />}>
                <ResetPassword />
              </Suspense>
            } />
            <Route path="/check-email" element={
              <Suspense fallback={<LoadingFallback />}>
                <CheckEmail />
              </Suspense>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
