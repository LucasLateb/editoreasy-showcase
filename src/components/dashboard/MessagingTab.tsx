
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MessagingTab = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <Alert variant="default" className="mb-4">
        <AlertTitle>Premium Feature</AlertTitle>
        <AlertDescription>
          Messaging is only available on <span className="font-semibold">Premium</span> and <span className="font-semibold">Pro</span> plans.
        </AlertDescription>
        <Button
          variant="default"
          className="mt-4"
          onClick={() => navigate('/pricing')}
        >
          Upgrade Plan
        </Button>
      </Alert>
      <div className="bg-background p-6 rounded-lg border shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Messaging Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            The messaging feature will be available soon. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagingTab;

