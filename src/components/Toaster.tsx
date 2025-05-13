
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  // Using Sonner's Toaster directly instead of the shadcn wrapper
  // for better performance and to avoid type conflicts
  return <SonnerToaster position="bottom-right" closeButton richColors />;
}
