
import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessagingTab = () => {
  return (
    <div className="space-y-8">
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
