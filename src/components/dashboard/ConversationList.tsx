import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ConversationListItem from './ConversationListItem';
import { Conversation, Message as MessageType } from '@/types/messaging';
import { User as AuthUser } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (conversationId: string, otherParticipant: AuthUser | null | undefined) => void;
  selectedConversationId: string | null;
}

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
}

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
    .select('content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
    console.error('Error fetching last message:', error);
  }
  return data as MessageType | null; // Assuming MessageType structure is simple and doesn't need deep mapping here
};


const ConversationList: React.FC<ConversationListProps> = ({ onSelectConversation, selectedConversationId }) => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rawConversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', currentUser?.id],
    queryFn: () => {
      if (!currentUser?.id) return Promise.resolve([]);
      return fetchConversations(currentUser.id);
    },
    enabled: !!currentUser?.id,
  });

  const [enrichedConversations, setEnrichedConversations] = useState<Conversation[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  useEffect(() => {
    const enrichConversations = async () => {
      if (!rawConversations || !currentUser) return;
      setIsEnriching(true);
      const enriched = await Promise.all(
        rawConversations.map(async (conv) => {
          const otherParticipantId = conv.participant_ids.find(id => id !== currentUser.id);
          let otherParticipant: AuthUser | null = null;
          if (otherParticipantId) {
            otherParticipant = await fetchUserProfile(otherParticipantId);
          }
          const lastMessage = await fetchLastMessage(conv.id);
          return { 
            ...conv, 
            otherParticipant, // Use the mapped participant
            lastMessagePreview: lastMessage?.content 
          };
        })
      );
      setEnrichedConversations(enriched);
      setIsEnriching(false);
    };

    enrichConversations();
  }, [rawConversations, currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const conversationsSubscription = supabase
      .channel('public:conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `participant_ids=cs.{"${currentUser.id}"}` },
        (payload) => {
          console.log('Conversation change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id]});
        }
      )
      .subscribe();
    
    const messagesSubscription = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
            console.log('New message received for potential conversation update!', payload);
            // Check if this message belongs to one of the current user's conversations
            const message = payload.new as MessageType; // Assume MessageType is simple
            const conversation = enrichedConversations.find(c => c.id === message.conversation_id);
            if (conversation) {
                queryClient.invalidateQueries({ queryKey: ['conversations', currentUser.id] });
                // queryClient.invalidateQueries({ queryKey: ['messages', message.conversation_id] }); // This is handled by MessageArea
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentUser, queryClient, enrichedConversations]);


  const filteredConversations = enrichedConversations.filter(conv => 
    conv.otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingConversations || isEnriching) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-8 w-full mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              currentUser={currentUser as AuthUser} // Assuming currentUser is correctly typed or mapped elsewhere
              onSelectConversation={onSelectConversation}
              isSelected={selectedConversationId === conversation.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
