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
      console.log('[MessagingTab] Fetching initial conversations for user:', currentUser.id);
      return fetchConversations(currentUser.id);
    },
    enabled: !!currentUser?.id,
  });

  const enrichAndSetConversations = useCallback(async (convsToEnrich: Conversation[], currentUserId: string) => {
    console.log('[MessagingTab] Starting to enrich conversations:', convsToEnrich.length);
    setIsEnriching(true);
    const currentlySelectedId = selectedConversationId; 
    const enriched = await Promise.all(
      convsToEnrich.map(async (conv) => {
        const otherParticipantId = conv.participant_ids.find(id => id !== currentUserId);
        let otherParticipantProfile: AuthUser | null = null;
        if (otherParticipantId) {
          otherParticipantProfile = await fetchUserProfile(otherParticipantId);
        }
        const lastMessage = await fetchLastMessage(conv.id);
        
        const existingConv = enrichedConversations.find(ec => ec.id === conv.id);
        // Retain existing unread count if not a brand new conversation from initial fetch, 
        // or if it's updated by subscription (which handles its own unread logic)
        let unread_count = existingConv?.unread_count || 0;
        console.log(`[MessagingTab] Enriching conv ${conv.id}. Existing unread: ${unread_count}, Last message sender: ${lastMessage?.sender_id}, Current user: ${currentUserId}, Selected: ${currentlySelectedId}`);

        return {
          ...conv,
          otherParticipant: otherParticipantProfile,
          lastMessagePreview: lastMessage?.content,
          unread_count: unread_count,
        };
      })
    );
    console.log('[MessagingTab] Finished enriching conversations. Result:', enriched);
    setEnrichedConversations(enriched);
    setIsEnriching(false);
  }, [selectedConversationId, enrichedConversations, currentUser?.id]); // Added currentUser.id to ensure currentUserId is up-to-date

  useEffect(() => {
    if (rawConversations && currentUser?.id) {
      console.log('[MessagingTab] Raw conversations fetched, enriching...');
      enrichAndSetConversations(rawConversations, currentUser.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawConversations, currentUser?.id]); // enrichAndSetConversations is not added to avoid re-enriching on every unread_count change


  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('[MessagingTab] Setting up Supabase subscriptions for user:', currentUser.id);

    const conversationsChannel = supabase
      .channel('public:conversations:messagingtab-rls-debug') 
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        (payload) => {
          console.log('[MessagingTab] Conversation change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
        }
      )
      .subscribe((status, err) => {
        console.log('[MessagingTab] Conversations channel status:', status, 'Error:', err);
      });
    
    const messagesChannel = supabase
      .channel('public:messages:messagingtab-rls-debug') 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
            const newMessage = payload.new as MessageType;
            console.log('[MessagingTab] New message received via subscription:', newMessage);
            
            const conversationExists = enrichedConversations.some(c => c.id === newMessage.conversation_id);
            if (!conversationExists) {
              console.log('[MessagingTab] New message for a conversation not yet in the list. Invalidating conversations query.');
              queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
              // The re-fetch and enrichment will handle this new conversation.
              // Potentially, we might want to mark it as unread here if we fetch and enrich it immediately.
              // For now, relying on the query invalidation.
              return;
            }

            console.log('[MessagingTab] Processing new message for unread count. Current selectedConversationId:', selectedConversationId);

            setEnrichedConversations(prevConvs => {
              console.log('[MessagingTab] Updating enrichedConversations. Previous state:', prevConvs);
              const updatedConvs = prevConvs.map(conv => {
                if (conv.id === newMessage.conversation_id) {
                  const isCurrentUserSender = newMessage.sender_id === currentUser.id;
                  let newUnreadCount = conv.unread_count || 0;

                  if (!isCurrentUserSender && conv.id !== selectedConversationId) {
                    newUnreadCount = (conv.unread_count || 0) + 1;
                    console.log(`[MessagingTab] Incrementing unread count for conv ${conv.id} to ${newUnreadCount}. Message from other user, and conv not selected.`);
                  } else if (isCurrentUserSender) {
                    console.log(`[MessagingTab] Message from current user for conv ${conv.id}. Unread count remains ${newUnreadCount}.`);
                  } else if (conv.id === selectedConversationId) {
                    // If convo is selected, new messages are implicitly read, so unread count should not increment.
                    // It should have been set to 0 on selection.
                    console.log(`[MessagingTab] New message for currently selected conv ${conv.id}. Unread count remains ${newUnreadCount}.`);
                  }
                  
                  return { 
                    ...conv, 
                    lastMessagePreview: newMessage.content,
                    last_message_at: newMessage.created_at,
                    unread_count: newUnreadCount
                  };
                }
                return conv;
              }).sort((a, b) => {
                const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                return dateB - dateA;
              });
              console.log('[MessagingTab] Updated enrichedConversations state:', updatedConvs);
              return updatedConvs;
            });

             if (newMessage.conversation_id === selectedConversationId) {
                 console.log('[MessagingTab] New message for selected conversation, invalidating messages query for MessageArea.');
                 queryClient.invalidateQueries({queryKey: ['messages', newMessage.conversation_id]});
             }
        }
      )
      .subscribe((status, err) => {
        console.log('[MessagingTab] Messages channel status:', status, 'Error:', err);
      });

    return () => {
      console.log('[MessagingTab] Cleaning up Supabase subscriptions.');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUser?.id, queryClient, enrichedConversations, selectedConversationId]); // Re-added enrichedConversations and selectedConversationId carefully.


  const handleSelectConversation = (conversationId: string, participant: AuthUser | null | undefined) => {
    console.log(`[MessagingTab] Selecting conversation ${conversationId}. Participant:`, participant);
    setSelectedConversationId(conversationId);
    setOtherParticipant(participant);

    setEnrichedConversations(prevConvs => {
      console.log('[MessagingTab] Resetting unread count for selected conversation. Previous state:', prevConvs);
      const updatedConvs = prevConvs.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      );
      console.log('[MessagingTab] Updated enrichedConversations state after selection:', updatedConvs);
      return updatedConvs;
    });
  };
  
  useEffect(() => {
    if (onTotalUnreadChange) {
      const total = enrichedConversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
      console.log('[MessagingTab] Calculating total unread messages:', total, 'from conversations:', enrichedConversations.map(c => ({id: c.id, unread: c.unread_count })));
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
    <div className="flex h-[calc(100vh-240px)] border rounded-lg overflow-hidden">
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
