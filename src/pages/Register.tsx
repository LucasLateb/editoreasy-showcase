
import React from 'react';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <Alert className="mb-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              {t('Register.AccountTypeInfo')}
              <ul className="mt-2 ml-6 list-disc">
                <li className="mb-1"><strong>{t('Register.Editor')}:</strong> {t('Register.EditorDescription')}</li>
                <li><strong>{t('Register.Client')}:</strong> {t('Register.ClientDescription')}</li>
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
