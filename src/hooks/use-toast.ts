
// Custom hook for toast notifications
import { useState, ReactNode } from 'react';
import { toast as sonnerToast, type ToastT } from 'sonner';

export type Action = {
  label: string | ReactNode;
  onClick: () => void;
};

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: ReactNode | Action;
};

export function useToast() {
  // We don't actually need any state here since we're using Sonner
  // which manages its own state internally
  const [toasts, setToasts] = useState<ToastT[]>([]);

  function toast({
    title,
    description,
    variant = 'default',
    duration = 5000,
    action,
    ...props
  }: ToastProps) {
    const toastOptions = {
      duration,
      ...props,
    };

    // Map our variants to Sonner's types
    const type = variant === 'destructive' ? 'error' : 
                variant === 'success' ? 'success' : 'default';

    // Handle the toast based on content
    if (action && typeof action === 'object' && 'label' in action && 'onClick' in action) {
      return sonnerToast[type](title, {
        description,
        action: {
          label: action.label,
          onClick: action.onClick,
        },
        ...toastOptions,
      });
    }

    return sonnerToast[type](title, {
      description,
      ...toastOptions,
    });
  }

  return {
    toast,
    toasts,
    dismiss: sonnerToast.dismiss,
  };
}

export { toast } from 'sonner';
