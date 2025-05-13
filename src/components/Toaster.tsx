
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  // Using Sonner's Toaster directly for better performance
  return <SonnerToaster position="bottom-right" closeButton richColors />;
}
