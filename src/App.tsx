
import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import CheckEmail from '@/pages/CheckEmail';

// Optimize lazy loading with proper error boundaries
const Index = lazy(() => import('@/pages/Index').catch(() => ({ default: () => <ErrorFallback /> })));
const Dashboard = lazy(() => import('@/pages/Dashboard').catch(() => ({ default: () => <ErrorFallback /> })));
const Portfolio = lazy(() => import('@/pages/Portfolio').catch(() => ({ default: () => <ErrorFallback /> })));
const Pricing = lazy(() => import('@/pages/Pricing').catch(() => ({ default: () => <ErrorFallback /> })));
const Explore = lazy(() => import('@/pages/Explore').catch(() => ({ default: () => <ErrorFallback /> })));
const Login = lazy(() => import('@/pages/Login').catch(() => ({ default: () => <ErrorFallback /> })));
const Register = lazy(() => import('@/pages/Register').catch(() => ({ default: () => <ErrorFallback /> })));

// Error fallback component for lazy loading failures
const ErrorFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-6">
        We couldn't load this page. This could be due to a temporary issue or a network problem.
      </p>
      <button 
        onClick={() => window.location.reload(true)} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Reload page
      </button>
    </div>
  </div>
);

// Optimize query client configuration with proper error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      gcTime: 5 * 60 * 1000,
      // Add proper error handling for queries
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

    const checkRecoveryToken = () => {
      try {
        // Only check hash if it exists
        if (location.hash) {
          const hasRecoveryToken = location.hash.includes('type=recovery');
          
          if (hasRecoveryToken) {
            const hashParams = new URLSearchParams(location.hash.substring(1));
            const accessToken = hashParams.get('access_token');
            
            if (accessToken) {
              // Use timeout to prevent immediate navigation that might cause DOM issues
              setTimeout(() => {
                navigate('/reset-password');
              }, 0);
            }
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

// App error boundary to catch runtime errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">
              We encountered an error while rendering this page.
            </p>
            <button 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload(true);
              }} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
