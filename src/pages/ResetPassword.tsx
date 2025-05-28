
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if we're in recovery mode from URL
  useEffect(() => {
    const checkRecoveryMode = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session) {
        // Get URL hash to check for recovery token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery = hashParams.get('type') === 'recovery';
        
        if (isRecovery) {
          setRecoveryMode(true);
        } else {
          // If not in recovery mode and already logged in, redirect to dashboard
          navigate('/dashboard');
        }
      }
    };

    checkRecoveryMode();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('Common.Error'),
        description: t('ResetPassword.PasswordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t('Common.Error'),
        description: t('ResetPassword.PasswordTooShort'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: t('Common.Success'),
        description: t('ResetPassword.PasswordResetSuccess'),
      });
      
      navigate('/login');
    } catch (error: any) {
      toast({
        title: t('Common.Error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-20 px-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{t('ResetPassword.Title')}</h1>
          <p className="text-gray-500">
            {t('ResetPassword.Description')}
          </p>
        </div>

        {!recoveryMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  {t('ResetPassword.ResetWarningTitle')}
                </p>
                <p className="text-sm text-yellow-800 mt-2">
                  {t('ResetPassword.ResetWarningDescription')}{" "}
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-800 underline"
                    onClick={() => navigate('/forgot-password')}
                  >
                    {t('ResetPassword.ForgotPasswordLink')}
                  </Button>{" "}
                  {t('ResetPassword.PageFirst')}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder={t('ResetPassword.NewPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <Input
              type="password"
              placeholder={t('ResetPassword.ConfirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('ResetPassword.Resetting') : t('ResetPassword.ResetPassword')}
          </Button>
        </form>
      </div>
    </div>
  );
}
