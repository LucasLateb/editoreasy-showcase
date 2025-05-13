
// Re-export the useToast and toast from the hooks directory
import { useToast as useHookToast, toast, type Action, type ToastProps } from "@/hooks/use-toast";

export const useToast = () => {
  return useHookToast();
};

export { toast, type Action, type ToastProps };
