
import * as React from "react"
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
        // Remove properties that might conflict with shadcn Toast component
        const { type, variant, ...restProps } = props as any;
        
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
                altText={typeof action.label === 'string' ? action.label : 'Action'}
                onClick={(action as any).onClick}
              >
                {action.label as ReactNode}
              </ToastAction>
            ) : null}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
