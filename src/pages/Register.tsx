
import React from 'react';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Authentication is now live with Supabase! Create your account to start showcasing your work.
            </AlertDescription>
          </Alert>
          <AuthForm type="register" />
        </div>
      </div>
    </div>
  );
};

export default Register;
