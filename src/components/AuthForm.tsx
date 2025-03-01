
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (type === 'login') {
        await login(email, password);
        toast({
          title: "Logged in successfully",
          description: "Welcome back to VideoCut!",
        });
      } else {
        await register(name, email, password);
        toast({
          title: "Account created",
          description: "Welcome to VideoCut!",
        });
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-background border border-border">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
        <p className="text-muted-foreground mt-2">
          {type === 'login' 
            ? 'Enter your credentials to access your account' 
            : 'Sign up to start showcasing your video editing work'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="glass-input"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="glass-input"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            {type === 'login' && (
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="glass-input"
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (type === 'login' ? 'Logging in...' : 'Creating account...') 
            : (type === 'login' ? 'Log in' : 'Create account')}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        {type === 'login' ? (
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
