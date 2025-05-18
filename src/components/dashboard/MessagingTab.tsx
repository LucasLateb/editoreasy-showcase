
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import { User as AuthUser } from '@/types'; // For otherParticipant type

const MessagingTab = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<AuthUser | null | undefined>(null);

  const handleSelectConversation = (conversationId: string, participant: AuthUser | null | undefined) => {
    setSelectedConversationId(conversationId);
    setOtherParticipant(participant);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <MessageCircle className="h-12 w-12 text-muted-foreground animate-pulse" />
        <p className="ml-4">Loading messages...</p>
      </div>
    );
  }

  const canAccessMessaging = currentUser?.subscriptionTier === 'premium' || currentUser?.subscriptionTier === 'pro';

  if (!canAccessMessaging) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <Alert variant="default">
          <MessageCircle className="h-5 w-5" />
          <AlertTitle>Premium Feature</AlertTitle>
          <AlertDescription>
            Messaging is only available on <span className="font-semibold">Premium</span> and <span className="font-semibold">Pro</span> plans.
            Upgrade your plan to connect with other users directly.
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
            <h2 className="text-xl font-semibold">Advanced Messaging Awaits</h2>
            <p className="text-muted-foreground max-w-md">
              Unlock direct messaging by upgrading your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-180px)] border rounded-lg overflow-hidden"> {/* Adjust height as needed */}
      <div className="w-1/3 border-r h-full">
        <ConversationList 
          onSelectConversation={handleSelectConversation} 
          selectedConversationId={selectedConversationId}
        />
      </div>
      <div className="w-2/3 h-full">
        <MessageArea 
          selectedConversationId={selectedConversationId}
          otherParticipant={otherParticipant}
        />
      </div>
    </div>
  );
};

export default MessagingTab;
