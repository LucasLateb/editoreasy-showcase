
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
              Choose your account type:
              <ul className="mt-2 ml-6 list-disc">
                <li className="mb-1"><strong>Monteur:</strong> For video editors who want to showcase their work and attract clients.</li>
                <li><strong>Client:</strong> For users who want to find and hire video editors for their projects.</li>
              </ul>
            </AlertDescription>
          </Alert>
          <AuthForm type="register" />
        </div>
      </div>
    </div>
  );
};

export default Register;
