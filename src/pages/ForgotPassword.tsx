
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the current URL base (domain + protocol)
      const baseUrl = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });

      if (error) {
        throw error;
      }

      // Show info dialog instead of just a toast
      setShowInfoDialog(true);
      
      toast({
        title: t('ForgotPassword.CheckYourEmail'),
        description: t('ForgotPassword.PasswordResetSent'),
      });
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
          <h1 className="text-2xl font-bold">{t('ForgotPassword.Title')}</h1>
          <p className="text-gray-500">
            {t('ForgotPassword.Description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder={t('ForgotPassword.EnterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('ForgotPassword.Sending') : t('ForgotPassword.SendResetLink')}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate('/login')}
          >
            {t('ForgotPassword.BackToLogin')}
          </Button>
        </div>
      </div>

      {/* Information Dialog */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ForgotPassword.CheckEmailTitle')}</DialogTitle>
            <DialogDescription>
              {t('ForgotPassword.CheckEmailDescription', { email })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t('ForgotPassword.CheckEmailInfo')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('ForgotPassword.CheckEmailLinkInfo')}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => {
              setShowInfoDialog(false);
              navigate('/login');
            }}>
              {t('ForgotPassword.ReturnToLogin')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
