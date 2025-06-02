
import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MailCheck } from "lucide-react";

const CheckEmail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary px-4">
      <div className="bg-background px-8 py-10 rounded-2xl border border-border max-w-md w-full text-center">
        <MailCheck className="mx-auto mb-4 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold mb-4">{t('Auth.CheckEmail')}</h1>
        <p className="mb-6 text-muted-foreground">
          {t('Auth.CheckEmailDescription')}<br /><br />
          {t('Auth.EmailVerified')}
        </p>
        <Button onClick={() => navigate("/login")} className="w-full mt-2">
          {t('Auth.BackToLogin')}
        </Button>
      </div>
    </div>
  );
};

export default CheckEmail;
