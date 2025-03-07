
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto mb-6">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Authentication is now live with Supabase! You can create a real account or log in.
            </AlertDescription>
          </Alert>
          <AuthForm type="login" />
        </div>
      </div>
    </div>
  );
};

export default Login;
