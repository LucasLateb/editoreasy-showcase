
import { useToast as useShadcnToast } from "@/components/ui/use-toast"
import { toast as sonnerToast, type ToastT } from 'sonner';
import { ReactNode } from 'react';

export type Action = {
  label: string | ReactNode;
  onClick: () => void;
};

export interface ToastProps extends ToastT {
  id: string;
  title?: string;
  description?: ReactNode;
  action?: Action;
}

export const useToast = () => {
  const { toast } = useShadcnToast();
  
  return {
    toast: (props: Partial<ToastProps>) => sonnerToast(props.title || '', {
      description: props.description,
      action: props.action,
      ...props,
    }),
    toasts: [] as ToastProps[], // This is a placeholder for type compatibility
  };
};

export const toast = (props: Partial<ToastProps>) => 
  sonnerToast(props.title || '', {
    description: props.description,
    action: props.action,
    ...props,
  });
