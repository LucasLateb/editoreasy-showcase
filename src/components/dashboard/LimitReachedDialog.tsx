
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
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limite d'upload atteinte</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez atteint la limite de {limit} vidéos pour votre plan actuel "{currentTierName}".
            Pour uploader plus de vidéos, veuillez mettre à niveau votre plan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onUpgrade}>
              Mettre à niveau le plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LimitReachedDialog;
