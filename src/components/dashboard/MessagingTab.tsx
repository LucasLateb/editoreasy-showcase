import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    .select('content, created_at, sender_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found, which is fine for last message
    console.error('Error fetching last message:', error);
  }
  return data as MessageType | null;
};

interface MessagingTabProps {
  onTotalUnreadChange?: (count: number) => void;
}

const MessagingTab: React.FC<MessagingTabProps> = ({ onTotalUnreadChange }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
        let unread_count = existingConv?.unread_count || 0;

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
  }, [selectedConversationId, currentUser?.id]); // Removed enrichedConversations to avoid loop

  useEffect(() => {
    if (rawConversations && currentUser?.id) {
      console.log('[MessagingTab] Raw conversations fetched, enriching...');
      enrichAndSetConversations(rawConversations, currentUser.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawConversations, currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    console.log('[MessagingTab] Setting up Supabase subscriptions for user:', currentUser.id);

    const conversationsChannel = supabase
      .channel('public:conversations:messagingtab-rls-realtime') 
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        (payload) => {
          console.log('[MessagingTab] Conversation change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[MessagingTab] Successfully subscribed to conversations channel.');
        } else {
          console.error('[MessagingTab] Conversations channel subscription error:', status, err);
        }
      });
    
    const messagesChannel = supabase
      .channel('public:messages:messagingtab-rls-realtime') 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
            const newMessage = payload.new as MessageType;
            console.log('[MessagingTab] New message received via subscription:', newMessage);
            
            const targetConversation = enrichedConversations.find(c => c.id === newMessage.conversation_id);
            
            if (!targetConversation) {
              console.log(`[MessagingTab] New message for conversation ${newMessage.conversation_id} not in current list. Invalidating conversations query.`);
              queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
              return;
            }

            setEnrichedConversations(prevConvs => {
              const updatedConvs = prevConvs.map(conv => {
                if (conv.id === newMessage.conversation_id) {
                  const isCurrentUserSender = newMessage.sender_id === currentUser.id;
                  let newUnreadCount = conv.unread_count || 0;

                  if (!isCurrentUserSender && conv.id !== selectedConversationId) {
                    newUnreadCount = (conv.unread_count || 0) + 1;
                    console.log(`[MessagingTab] Incrementing unread count for conv ${conv.id} to ${newUnreadCount}.`);
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
              return updatedConvs;
            });

             if (newMessage.conversation_id === selectedConversationId) {
                 console.log('[MessagingTab] New message for selected conversation, invalidating messages query for MessageArea.');
                 queryClient.invalidateQueries({queryKey: ['messages', newMessage.conversation_id]});
             }
        }
      )
      .subscribe((status, err) => {
         if (status === 'SUBSCRIBED') {
          console.log('[MessagingTab] Successfully subscribed to messages channel.');
        } else {
          console.error('[MessagingTab] Messages channel subscription error:', status, err);
        }
      });

    return () => {
      console.log('[MessagingTab] Cleaning up Supabase subscriptions.');
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, queryClient, selectedConversationId, enrichedConversations]); // enrichedConversations added back to handle targetConversation check reliably.

  const handleSelectConversation = useCallback((conversationId: string, participant: AuthUser | null | undefined) => {
    console.log(`[MessagingTab] Selecting conversation ${conversationId}. Participant:`, participant);
    setSelectedConversationId(conversationId);
    setOtherParticipant(participant);

    setEnrichedConversations(prevConvs => 
      prevConvs.map(conv =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      )
    );
  }, [setSelectedConversationId, setOtherParticipant, setEnrichedConversations]);

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('conversationId');
  
    if (conversationIdFromUrl && enrichedConversations.length > 0 && !isLoadingConversationsInitial && !isEnriching) {
      const conversationToSelect = enrichedConversations.find(conv => conv.id === conversationIdFromUrl);
      if (conversationToSelect) {
        if (selectedConversationId !== conversationIdFromUrl) {
          console.log(`[MessagingTab] Selecting conversation ${conversationIdFromUrl} from URL. Participant:`, conversationToSelect.otherParticipant);
          handleSelectConversation(conversationIdFromUrl, conversationToSelect.otherParticipant);
        }
        // Clear the param after processing
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('conversationId');
        setSearchParams(newSearchParams, { replace: true });
      } else {
        console.warn(`[MessagingTab] Conversation ID ${conversationIdFromUrl} from URL not found. Clearing param.`);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('conversationId');
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setSearchParams, enrichedConversations, selectedConversationId, isLoadingConversationsInitial, isEnriching, handleSelectConversation, currentUser?.id]);
  
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

  const canAccessMessaging = currentUser?.role === 'client' || 
                             currentUser?.subscriptionTier === 'premium' || 
                             currentUser?.subscriptionTier === 'pro';

  if (!canAccessMessaging) {
    return (
      <div className="space-y-8 p-4 md:p-6">
        <Alert variant="default">
          <MessageCircle className="h-5 w-5" />
          <AlertTitle>Premium Feature or Client Access</AlertTitle>
          <AlertDescription>
            Messaging is available for clients, or for users on <span className="font-semibold">Premium</span> and <span className="font-semibold">Pro</span> plans.
            Upgrade your plan if you are not a client and wish to access messaging.
          </AlertDescription>
          {currentUser?.role !== 'client' && (
            <Button
              variant="default"
              className="mt-4"
              onClick={() => navigate('/pricing')}
            >
              Upgrade Plan
            </Button>
          )}
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
