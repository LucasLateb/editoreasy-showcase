
import React from 'react';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <AuthForm type="register" />
        </div>
      </div>
    </div>
  );
};

export default Register;
