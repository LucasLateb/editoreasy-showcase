
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AuthFormProps {
  type: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState('monteur'); // Default role is "monteur"
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      if (type === 'login') {
        const result = await login(email, password);
        if (result) {
          toast({
            title: "Logged in successfully",
            description: "Welcome back to VideoCut!",
          });
        }
      } else {
        const result = await register(name, email, password, userRole);
        if (result) {
          toast({
            title: "Account created",
            description: "Please check your email to verify your account. After verification, you'll be redirected to your dashboard.",
            duration: 6000,
          });
          navigate('/check-email');
          return;
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMsg = "Authentication failed. Please check your credentials and try again.";
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = "Invalid email or password. Please try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = "Please check your email and confirm your address before logging in.";
        } else if (error.message.includes('User already registered')) {
          errorMsg = "An account with this email already exists. Try logging in instead.";
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "Authentication failed",
        description: errorMsg,
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
      
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
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
              disabled={isLoading}
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
            disabled={isLoading}
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
            minLength={6}
            disabled={isLoading}
          />
        </div>
        
        {type === 'register' && (
          <div className="space-y-2">
            <Label>I am a</Label>
            <RadioGroup 
              value={userRole} 
              onValueChange={setUserRole} 
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monteur" id="monteur" />
                <Label htmlFor="monteur" className="cursor-pointer">Monteur (Editor)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <Label htmlFor="client" className="cursor-pointer">Client</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
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
