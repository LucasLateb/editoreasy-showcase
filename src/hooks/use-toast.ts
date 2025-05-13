
import { toast as sonnerToast, type ToastT } from 'sonner';
import { ReactNode } from 'react';

export type Action = {
  label: string | ReactNode;
  onClick: () => void;
};

// Extend the ToastProps type to include variant
export interface ToastProps extends ToastT {
  id: string;
  title?: string;
  description?: ReactNode;
  action?: Action;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  return {
    toast: (props: Partial<ToastProps>) => sonnerToast(props.title || '', {
      description: props.description,
      action: props.action,
      // Map variant to type for sonner compatibility
      type: props.variant === 'destructive' ? 'error' : 'default',
      ...props,
    }),
    toasts: [] as ToastProps[], // This is a placeholder for type compatibility
  };
};

export const toast = (props: Partial<ToastProps>) => 
  sonnerToast(props.title || '', {
    description: props.description,
    action: props.action,
    // Map variant to type for sonner compatibility
    type: props.variant === 'destructive' ? 'error' : 'default',
    ...props,
  });
