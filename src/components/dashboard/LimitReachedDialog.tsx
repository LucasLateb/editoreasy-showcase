
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LimitReachedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentTierName: string;
  limit: number;
}

const LimitReachedDialog: React.FC<LimitReachedDialogProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentTierName,
  limit,
}) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('LimitReached.Title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('LimitReached.Description', { limit, tierName: currentTierName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('LimitReached.Cancel')}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onUpgrade}>
              {t('LimitReached.Upgrade')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LimitReachedDialog;
