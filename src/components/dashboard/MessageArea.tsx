import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MessageItem from './MessageItem';
import NewMessageForm from './NewMessageForm';
import { Message } from '@/types/messaging';
import { User as AuthUser } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageAreaProps {
  selectedConversationId: string | null;
  otherParticipant: AuthUser | null | undefined;
}

// Helper function to map Supabase profile data to AuthUser type (can be imported if moved to utils)
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

const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles(id, name, email, avatar_url, bio, subscription_tier, likes, created_at, role)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }

  if (!data) return [];

  return data.map((msg: any) => ({
    ...msg,
    sender: mapSupabaseProfileToAuthUser(msg.sender),
  }));
};

const MessageArea: React.FC<MessageAreaProps> = ({ selectedConversationId, otherParticipant }) => {
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => {
      if (!selectedConversationId) return Promise.resolve([]);
      return fetchMessages(selectedConversationId);
    },
    enabled: !!selectedConversationId,
  });

  useEffect(() => {
    if (!selectedConversationId) return;

    const channel = supabase
      .channel(`messages:${selectedConversationId}`) // Unique channel per conversation
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversationId}` },
        (payload) => {
          console.log('New message received via realtime in MessageArea!', payload);
          // Option 1: Optimistic update (more complex)
          // Option 2: Invalidate and refetch (simpler)
          queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
          queryClient.invalidateQueries({ queryKey: ['conversations', undefined] }); // Also update last message preview in conv list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, queryClient]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive or conversation changes
    if (scrollAreaRef.current) {
        const scrollViewport = scrollAreaRef.current.querySelector('div[style*="overflow: scroll"]');
        if (scrollViewport) {
            scrollViewport.scrollTop = scrollViewport.scrollHeight;
        }
    }
  }, [messages]);


  if (!selectedConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 h-full">
        <p>Select a conversation to start messaging.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-4">
        <div className="flex items-center p-4 border-b mb-4">
          <Skeleton className="h-10 w-10 rounded-full mr-3" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="flex-1 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-10 w-48 rounded-lg ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`} />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full mt-4" />
      </div>
    );
  }
  
  const FallbackName = otherParticipant?.name ? otherParticipant.name.substring(0, 2).toUpperCase() : '??';

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <div className="p-4 border-b flex items-center space-x-3 sticky top-0 bg-background z-10">
        <Avatar>
          <AvatarImage src={otherParticipant?.avatarUrl || undefined} alt={otherParticipant?.name || 'User'} />
          <AvatarFallback>{FallbackName}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{otherParticipant?.name || 'Select a conversation'}</h2>
          {/* Could add online status here later */}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-2">
            {messages?.map((message) => (
            <MessageItem key={message.id} message={message} />
            ))}
        </div>
      </ScrollArea>
      <NewMessageForm conversationId={selectedConversationId} />
    </div>
  );
};

export default MessageArea;
