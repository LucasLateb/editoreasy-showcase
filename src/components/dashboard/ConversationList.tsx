
import React, { useState } from 'react';
import ConversationListItem from './ConversationListItem';
import { Conversation } from '@/types/messaging';
import { User as AuthUser } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  currentUser: AuthUser | null;
  onSelectConversation: (conversationId: string, otherParticipant: AuthUser | null | undefined) => void;
  selectedConversationId: string | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  isLoading,
  currentUser,
  onSelectConversation, 
  selectedConversationId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const filteredConversations = conversations.filter(conv => 
    conv.otherParticipant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherParticipant?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
            placeholder={t('Messages.SearchContacts')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && !isLoading ? (
          <p className="p-4 text-center text-muted-foreground">{t('Messages.NoConversations')}</p>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              currentUser={currentUser as AuthUser}
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
