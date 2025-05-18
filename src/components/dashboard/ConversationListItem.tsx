
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Conversation } from '@/types/messaging';
import { User as AuthUser } from '@/types'; // Renamed to avoid conflict with User type if any

interface ConversationListItemProps {
  conversation: Conversation;
  currentUser: AuthUser;
  onSelectConversation: (conversationId: string, otherParticipant: AuthUser | null | undefined) => void;
  isSelected: boolean;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onSelectConversation,
  isSelected,
}) => {
  const otherParticipant = conversation.otherParticipant;
  const FallbackName = otherParticipant?.name ? otherParticipant.name.substring(0, 2).toUpperCase() : '??';

  return (
    <div
      className={`p-3 hover:bg-muted cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
      onClick={() => onSelectConversation(conversation.id, otherParticipant)}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={otherParticipant?.avatarUrl || undefined} alt={otherParticipant?.name || 'User'} />
          <AvatarFallback>{FallbackName}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{otherParticipant?.name || 'Unknown User'}</p>
          {conversation.lastMessagePreview && (
            <p className="text-xs text-muted-foreground truncate">{conversation.lastMessagePreview}</p>
          )}
        </div>
        {conversation.last_message_at && (
          <p className="text-xs text-muted-foreground">
            {new Date(conversation.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ConversationListItem;
