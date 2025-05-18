import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import { User as AuthUser } from '@/types';
import { Conversation, Message as MessageType } from '@/types/messaging';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';

// Helper functions (can be moved to a util file if used elsewhere)
const mapSupabaseProfileToAuthUser = (profile: any): AuthUser | null => {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name || undefined,
    email: profile.email || undefined,
    avatarUrl: profile.avatar_url || undefined,
    bio: profile.bio || undefined,
    subscriptionTier: profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro' ? profile.subscription_tier : 'free',
    likes: profile.likes || 0,
    createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
    role: profile.role || undefined,
  };
};

const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
  return data || [];
};

const fetchUserProfile = async (userId: string): Promise<AuthUser | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, bio, subscription_tier, likes, created_at, role')
    .eq('id', userId)
    .single();
  if (error) {
    console.error(`Error fetching profile for user ${userId}:`, error);
    return null;
  }
  return mapSupabaseProfileToAuthUser(data);
};

const fetchLastMessage = async (conversationId: string): Promise<MessageType | null> => {
  const { data, error } = await supabase
    .from('messages')
    .select('content, created_at, sender_id') // Added sender_id for unread logic
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching last message:', error);
  }
  return data as MessageType | null;
};

interface MessagingTabProps {
  onTotalUnreadChange?: (count: number) => void;
}

const MessagingTab: React.FC<MessagingTabProps> = ({ onTotalUnreadChange }) => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<AuthUser | null | undefined>(null);
  
  const [enrichedConversations, setEnrichedConversations] = useState<Conversation[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  const { data: rawConversations, isLoading: isLoadingConversationsInitial } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: () => {
      if (!currentUser?.id) return Promise.resolve([]);
      return fetchConversations(currentUser.id);
    },
    enabled: !!currentUser?.id,
  });

  const enrichAndSetConversations = useCallback(async (convsToEnrich: Conversation[], currentUserId: string) => {
    setIsEnriching(true);
    const currentlySelectedId = selectedConversationId; // Capture current selection
    const enriched = await Promise.all(
      convsToEnrich.map(async (conv) => {
        const otherParticipantId = conv.participant_ids.find(id => id !== currentUserId);
        let otherParticipantProfile: AuthUser | null = null;
        if (otherParticipantId) {
          otherParticipantProfile = await fetchUserProfile(otherParticipantId);
        }
        const lastMessage = await fetchLastMessage(conv.id);
        
        // Preserve existing unread count if conversation already exists in state
        const existingConv = enrichedConversations.find(ec => ec.id === conv.id);
        let unread_count = existingConv?.unread_count || 0;

        // If this is a newly fetched conversation (not from a realtime update that already set unread_count)
        // and it's not the currently selected one, and last message is not from current user, consider it unread.
        // This simplistic initial unread logic might need refinement for persistence.
        // For now, new messages make it unread unless current.
        if (!existingConv && lastMessage && lastMessage.sender_id !== currentUserId && conv.id !== currentlySelectedId) {
           // This logic is too simple for full unread, better to handle via subscriptions mainly
        }

        return {
          ...conv,
          otherParticipant: otherParticipantProfile,
          lastMessagePreview: lastMessage?.content,
          unread_count: unread_count, // Initialize or keep existing
        };
      })
    );
    setEnrichedConversations(enriched);
    setIsEnriching(false);
  }, [selectedConversationId, enrichedConversations]); // Added enrichedConversations to dependencies

  useEffect(() => {
    if (rawConversations && currentUser?.id) {
      enrichAndSetConversations(rawConversations, currentUser.id);
    }
  // enrichAndSetConversations is memoized, rawConversations and currentUser.id trigger this.
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [rawConversations, currentUser?.id]);


  useEffect(() => {
    if (!currentUser?.id) return;

    const conversationsChannel = supabase
      .channel('public:conversations:messagingtab') // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        (payload) => {
          console.log('Conversation change received in MessagingTab!', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
        }
      )
      .subscribe();
    
    const messagesChannel = supabase
      .channel('public:messages:messagingtab') // Unique channel name
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
            const newMessage = payload.new as MessageType;
            
            // Ensure this message belongs to one of the current user's conversations
            const conversationExists = enrichedConversations.some(c => c.id === newMessage.conversation_id);
            if (!conversationExists) return; // Message for a conversation not yet in the list

            console.log('New message for unread count processing:', newMessage);

            // Update last message preview and potentially unread count
            setEnrichedConversations(prevConvs => {
              return prevConvs.map(conv => {
                if (conv.id === newMessage.conversation_id) {
                  const isCurrentUserSender = newMessage.sender_id === currentUser.id;
                  // Increment unread_count if message not from current user AND conversation is not selected
                  const newUnreadCount = (!isCurrentUserSender && conv.id !== selectedConversationId)
                                        ? (conv.unread_count || 0) + 1
                                        : conv.unread_count; // Or 0 if current user sent it / convo selected

                  return { 
                    ...conv, 
                    lastMessagePreview: newMessage.content,
                    last_message_at: newMessage.created_at, // Update last_message_at for sorting
                    unread_count: newUnreadCount
                  };
                }
                return conv;
              }).sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()); // Re-sort
            });
            // Invalidate messages for the specific conversation if it's active (MessageArea handles its own query invalidation)
             if (newMessage.conversation_id === selectedConversationId) {
                 queryClient.invalidateQueries({queryKey: ['messages', newMessage.conversation_id]});
             }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUser?.id, queryClient, enrichedConversations, selectedConversationId]);


  const handleSelectConversation = (conversationId: string, participant: AuthUser | null | undefined) => {
    setSelectedConversationId(conversationId);
    setOtherParticipant(participant);
    // Mark selected conversation as read
    setEnrichedConversations(prevConvs =>
      prevConvs.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
  };
  
  useEffect(() => {
    if (onTotalUnreadChange) {
      const total = enrichedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      onTotalUnreadChange(total);
    }
  }, [enrichedConversations, onTotalUnreadChange]);


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
  
  const isLoading = isLoadingConversationsInitial || isEnriching;

  return (
    <div className="flex h-[calc(100vh-240px)] border rounded-lg overflow-hidden"> {/* Adjusted height slightly */}
      <div className="w-1/3 border-r h-full">
        <ConversationList 
          conversations={enrichedConversations}
          isLoading={isLoading}
          currentUser={currentUser}
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
