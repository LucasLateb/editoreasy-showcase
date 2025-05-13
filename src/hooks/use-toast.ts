
// Custom hook for toast notifications
import { useState } from 'react';
import { toast as sonnerToast, type ToastT } from 'sonner';

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function useToast() {
  // We don't actually need any state here since we're using Sonner
  // which manages its own state internally
  const [, setToasts] = useState<ToastT[]>([]);

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
    if (action) {
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
    dismiss: sonnerToast.dismiss,
  };
}

export { toast } from 'sonner';
