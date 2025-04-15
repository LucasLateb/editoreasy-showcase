import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardCopy, Check } from 'lucide-react';
import { toast } from 'sonner';

const CopyPortfolioLink: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Portfolio link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy the link.');
    }
  };

  return (
    <Button onClick={handleCopy} variant="outline" className="w-full mt-2">
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <ClipboardCopy className="w-4 h-4 mr-2" />
          Share
        </>
      )}
    </Button>
  );
};

export default CopyPortfolioLink;
