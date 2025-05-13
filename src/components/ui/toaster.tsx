
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { ReactNode } from "react";
import { ToastAction } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts && toasts.map(function ({ id, title, description, action, ...props }) {
        // We need to remove sonner's 'type' property as it conflicts with shadcn Toast
        const { type, ...restProps } = props as any;
        
        return (
          <Toast key={id} {...restProps}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action && typeof action === 'object' && 'label' in action ? (
              <ToastAction 
                altText={String(action.label || 'Action')}
                onClick={(action as any).onClick}
              >
                {action.label}
              </ToastAction>
            ) : (
              action as ReactNode
            )}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
